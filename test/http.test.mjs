import assert from 'node:assert/strict'
import http from 'node:http'
import { test } from 'node:test'
import { promises as fsp } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'dsh-wfc-http-'))
const indexDir = path.join(root, '.index')
const dataRoot = path.join(root, 'wxid_test_abcd', 'msg', 'file', '2026-01')
await fsp.mkdir(dataRoot, { recursive: true })
const payload = 'C'.repeat(80_000)
await fsp.writeFile(path.join(dataRoot, '报告.docx'), `${payload}V1`)
await fsp.writeFile(path.join(dataRoot, '报告(1).docx'), `${payload}V1`)
await fsp.writeFile(path.join(dataRoot, '报告(2).docx'), `${payload}V2`)

process.env.DSH_WECHAT_CLEANER_HOME = indexDir
const { apply } = await import('../index.js')

let route
apply({
  effect(fn) { return fn() },
  webServer: {
    register(definition) {
      route = definition
      return () => {}
    },
  },
  connection: {
    requestRejection({ headers }) {
      if (headers.origin && !headers.origin.startsWith('http://127.0.0.1:')) return 403
      return undefined
    },
    admit({ headers }) {
      const cookie = String(headers.cookie || '')
      return cookie.split(';').some((part) => part.trim() === 'dsh_test=authenticated')
        ? { peer: { id: 'test-peer' } }
        : { rejection: 401 }
    },
  },
})
assert.equal(route.kind, 'exact')
assert.equal(typeof route.handler, 'function')

const server = http.createServer((req, res) => route.handler(req, res))
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const endpoint = `http://127.0.0.1:${server.address().port}/wechat-file-cleaner/api`

test.after(async () => {
  await new Promise((resolve) => server.close(resolve))
  await fsp.rm(root, { recursive: true, force: true })
})

async function call(action, body = {}, headers = {}) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-wechat-cleaner': '1',
      'sec-fetch-site': 'same-origin',
      cookie: 'dsh_test=authenticated',
      ...headers,
    },
    body: JSON.stringify({ action, ...body }),
  })
  return { status: response.status, body: await response.json() }
}

test('rejects non-POST, unmarked, unauthenticated and cross-origin requests', async () => {
  const getResponse = await fetch(endpoint)
  assert.equal(getResponse.status, 405)
  assert.equal(getResponse.headers.get('allow'), 'POST')

  const unmarked = await call('scan', {}, { 'x-wechat-cleaner': '0' })
  assert.equal(unmarked.status, 403)

  const unauthenticated = await call('scan', {}, { cookie: '' })
  assert.equal(unauthenticated.status, 401)

  const crossOrigin = await call('scan', {}, { origin: 'https://evil.example' })
  assert.equal(crossOrigin.status, 403)

  const unknown = await call('does-not-exist')
  assert.equal(unknown.status, 400)
})

test('supports a whole-group cleanup with explicit consent and restore', async () => {
  const scan = await call('scan', { root })
  assert.equal(scan.status, 200, JSON.stringify(scan.body))
  assert.equal(scan.body.scan.accounts.length, 1)
  const group = scan.body.scan.groups[0]
  assert.equal(group.files.length, 3)

  const allIds = group.files.map((file) => file.id)
  const prepared = await call('prepare', { scanId: scan.body.scan.scanId, fileIds: allIds })
  assert.equal(prepared.status, 200, JSON.stringify(prepared.body))
  assert.equal(prepared.body.plan.fileCount, 3)

  const unacknowledged = await call('delete', { planId: prepared.body.plan.planId })
  assert.equal(unacknowledged.status, 400)

  const deleted = await call('delete', { planId: prepared.body.plan.planId, acknowledged: true })
  assert.equal(deleted.status, 200, JSON.stringify(deleted.body))
  assert.equal(deleted.body.batch.fileCount, 3)

  const list = await call('trash/list')
  assert.equal(list.body.batches.length, 1)
  assert.equal(list.body.batches[0].fileCount, 3)

  const restored = await call('trash/restore', { batchId: deleted.body.batch.id })
  assert.equal(restored.body.result.restored, 3)

  const after = await call('trash/list')
  assert.equal(after.body.batches.length, 0)
  for (const file of group.files) await fsp.stat(file.path)
})

test('scans and cleans files above a size threshold with an extension filter', async () => {
  const scan = await call('scan', {
    root,
    mode: 'large',
    minBytes: 50_000,
    extensions: ['docx'],
  })
  assert.equal(scan.status, 200, JSON.stringify(scan.body))
  assert.equal(scan.body.scan.mode, 'large')
  assert.equal(scan.body.scan.totalFiles, 3)
  assert.equal(scan.body.scan.groups.length, 1)
  assert.equal(scan.body.scan.groups[0].kind, 'large')
  assert.ok(scan.body.scan.groups[0].files.every((file) => file.name.endsWith('.docx')))

  const fileIds = scan.body.scan.groups.flatMap((group) => group.files.map((file) => file.id))
  const prepared = await call('prepare', { scanId: scan.body.scan.scanId, fileIds })
  assert.equal(prepared.status, 200, JSON.stringify(prepared.body))
  const deleted = await call('delete', { planId: prepared.body.plan.planId, acknowledged: true })
  assert.equal(deleted.status, 200, JSON.stringify(deleted.body))
  assert.equal(deleted.body.batch.fileCount, 3)
  const restored = await call('trash/restore', { batchId: deleted.body.batch.id })
  assert.equal(restored.body.result.restored, 3)
})
