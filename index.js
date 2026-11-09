/**
 * Host half of the WeChat file cleaner: a same-origin JSON endpoint that scans,
 * prepares an explicit deletion plan, and moves only approved files into the
 * restorable quarantine implemented by trash.js.
 */
import crypto from 'node:crypto'
import { promises as fsp } from 'node:fs'
import { scanLargeFiles, scanWeChat } from './scanner.js'
import { listTrash, moveToTrash, restoreBatch } from './trash.js'

export const inject = ['webServer']

const API_PATH = '/wechat-file-cleaner/api'
const SCAN_TTL = 30 * 60 * 1000
const PLAN_TTL = 5 * 60 * 1000
const MAX_BODY_BYTES = 2 * 1024 * 1024

let scans = new Map()
let plans = new Map()

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function sendJson(res, status, payload) {
  if (res.writableEnded) return
  const body = JSON.stringify(payload)
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'content-length': Buffer.byteLength(body, 'utf8'),
  }
  if (status === 405) headers.allow = 'POST'
  res.writeHead(status, headers)
  res.end(body)
}

function fail(status, message) {
  return { ok: false, error: message }
}

function prune() {
  const now = Date.now()
  for (const [id, scan] of scans) {
    if (scan.consumed || now - scan.createdAt > SCAN_TTL) scans.delete(id)
  }
  for (const [id, plan] of plans) {
    if (now - plan.createdAt > PLAN_TTL) plans.delete(id)
  }
}

function publicScan(scan) {
  return {
    scanId: scan.id,
    createdAt: scan.createdAt,
    mode: scan.mode,
    roots: scan.roots,
    accounts: scan.accounts,
    groups: scan.groups,
    totalFiles: scan.totalFiles,
    totalBytes: scan.totalBytes,
    groupCount: scan.groupCount,
    exactGroups: scan.exactGroups,
    similarGroups: scan.similarGroups,
    reclaimableBytes: scan.reclaimableBytes,
    skippedSmall: scan.skippedSmall,
    skippedName: scan.skippedName,
    skippedFilter: scan.skippedFilter,
    thresholdBytes: scan.thresholdBytes,
    extensions: scan.extensions,
    truncated: scan.truncated,
    groupsTruncated: scan.groupsTruncated,
    warnings: scan.warnings,
    durationMs: scan.durationMs,
  }
}

async function scanAction(body) {
  prune()
  const extraRoot = typeof body.root === 'string' ? body.root : undefined
  const mode = body.mode === 'large' ? 'large' : 'duplicates'
  const result = mode === 'large'
    ? await scanLargeFiles({
      extraRoot,
      minBytes: body.minBytes,
      extensions: body.extensions,
    })
    : await scanWeChat({ extraRoot })
  const id = crypto.randomUUID()
  const fileById = new Map()
  const groupById = new Map()
  for (const group of result.groups) {
    groupById.set(group.id, group)
    for (const file of group.files) fileById.set(file.id, file)
  }
  const scan = {
    id,
    createdAt: Date.now(),
    consumed: false,
    ...result,
    fileById,
    groupById,
  }
  scans.set(id, scan)
  // Keep a bounded recent-scan cache; older entries are pruned first.
  if (scans.size > 3) {
    const oldest = [...scans.values()].sort((a, b) => a.createdAt - b.createdAt)[0]
    scans.delete(oldest.id)
  }
  return { ok: true, scan: publicScan(scan) }
}

async function prepareAction(body) {
  prune()
  const scan = scans.get(String(body.scanId || ''))
  if (!scan) throw new Error('扫描结果已过期，请重新扫描')
  if (scan.consumed) throw new Error('该扫描结果已被使用，请重新扫描')
  if (!Array.isArray(body.fileIds)) throw new Error('缺少要清理的文件')
  const ids = [...new Set(body.fileIds.filter((id) => typeof id === 'string'))]
  if (ids.length === 0) throw new Error('请选择要清理的文件')
  if (ids.length > 5000) throw new Error('单次最多清理 5000 个文件')
  const selected = new Set(ids)
  for (const id of ids) {
    if (!scan.fileById.has(id)) throw new Error('选择中包含未知文件，请重新扫描')
  }

  const files = ids.map((id) => scan.fileById.get(id))
  const groups = []
  const accounts = new Map()
  for (const group of scan.groups) {
    const selectedInGroup = group.files.filter((file) => selected.has(file.id))
    if (selectedInGroup.length === 0) continue
    groups.push({
      id: group.id,
      title: group.title,
      kind: group.kind,
      fileCount: selectedInGroup.length,
      bytes: selectedInGroup.reduce((sum, file) => sum + file.size, 0),
      accountName: group.accountName,
    })
  }
  for (const file of files) {
    accounts.set(file.accountId, { id: file.accountId, name: file.accountName })
  }

  const plan = {
    id: crypto.randomUUID(),
    scanId: scan.id,
    createdAt: Date.now(),
    files,
    groups,
    fileCount: files.length,
    bytes: files.reduce((sum, file) => sum + file.size, 0),
    accounts: [...accounts.values()],
  }
  plans.set(plan.id, plan)
  return {
    ok: true,
    plan: {
      planId: plan.id,
      fileCount: plan.fileCount,
      bytes: plan.bytes,
      groups: plan.groups,
      accounts: plan.accounts,
      expiresAt: plan.createdAt + PLAN_TTL,
    },
  }
}

async function deleteAction(body) {
  prune()
  if (body.acknowledged !== true) throw new Error('请先确认删除操作')
  const plan = plans.get(String(body.planId || ''))
  if (!plan) throw new Error('清理确认已过期，请重新确认')
  if (Date.now() - plan.createdAt > PLAN_TTL) {
    plans.delete(plan.id)
    throw new Error('清理确认已过期，请重新确认')
  }

  // Re-check the exact sources immediately before touching the disk.
  for (const file of plan.files) {
    let stat
    try {
      stat = await fsp.stat(file.path)
    } catch {
      throw new Error(`文件已不存在，请重新扫描：${file.name}`)
    }
    if (!stat.isFile() || stat.size !== file.size) {
      throw new Error(`文件已发生变化，请重新扫描：${file.name}`)
    }
  }

  const batch = await moveToTrash(plan.files)
  plans.delete(plan.id)
  const scan = scans.get(plan.scanId)
  if (scan) scan.consumed = true
  return { ok: true, batch }
}

function header(req, name) {
  const value = req.headers[name]
  return Array.isArray(value) ? value[0] : value
}

function checkRequest(req) {
  if (header(req, 'x-wechat-cleaner') !== '1') {
    return '拒绝未经标记的请求'
  }
  const site = header(req, 'sec-fetch-site')
  if (site && site !== 'same-origin' && site !== 'none') {
    return '拒绝跨站请求'
  }
  const origin = header(req, 'origin')
  if (origin) {
    let originHost
    try {
      originHost = new URL(origin).host
    } catch {
      return '拒绝无效来源'
    }
    if (!originHost || originHost !== header(req, 'host')) return '拒绝跨站请求'
  }
  return undefined
}

async function readBody(req) {
  const chunks = []
  let bytes = 0
  for await (const chunk of req) {
    bytes += chunk.length
    if (bytes > MAX_BODY_BYTES) throw new HttpError(413, '请求体过大')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

async function dispatch(body) {
  switch (body.action) {
    case 'scan':
      return scanAction(body)
    case 'prepare':
      return prepareAction(body)
    case 'delete':
      return deleteAction(body)
    case 'trash/list':
      return { ok: true, batches: await listTrash() }
    case 'trash/restore':
      return { ok: true, result: await restoreBatch(String(body.batchId || '')) }
    default:
      throw new HttpError(400, '未知操作')
  }
}

async function handle(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, fail(405, '只支持 POST 请求'))
    return
  }
  const rejection = checkRequest(req)
  if (rejection) {
    sendJson(res, 403, fail(403, rejection))
    return
  }
  const contentType = header(req, 'content-type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    sendJson(res, 415, fail(415, '请求体必须是 JSON'))
    return
  }

  let body
  try {
    const text = await readBody(req)
    body = text ? JSON.parse(text) : {}
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 400
    const message = error instanceof HttpError ? error.message : '无法解析请求体'
    sendJson(res, status, fail(status, message))
    return
  }

  try {
    const payload = await dispatch(body)
    sendJson(res, 200, payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    sendJson(res, 400, fail(400, message))
  }
}

/** Host plugin entry. */
export function apply(ctx) {
  ctx.effect(
    () => ctx.webServer.register({
      kind: 'exact',
      path: API_PATH,
      handler: (req, res) => handle(req, res).catch((error) => {
        console.error('[wechat-file-cleaner]', error)
        if (!res.headersSent) sendJson(res, 500, fail(500, '清理服务发生内部错误'))
        else res.destroy()
      }),
    }),
    'wechat-file-cleaner: HTTP endpoint',
  )
}
