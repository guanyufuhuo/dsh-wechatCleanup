/**
 * Restorable quarantine for approved WeChat file cleanups. Files are moved,
 * never unlinked, and every batch carries a manifest for one-click restore.
 */
import { promises as fsp } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'

const INDEX_DIR = process.env.DSH_WECHAT_CLEANER_HOME
  ? path.resolve(process.env.DSH_WECHAT_CLEANER_HOME)
  : path.join(os.homedir(), '.dsh-wechat-cleaner')
const INDEX_PATH = path.join(INDEX_DIR, 'index.json')
const TRASH_FOLDER = '.dsh-wechat-cleaner'
const MAX_BATCHES = 100

let queue = Promise.resolve()

function withLock(operation) {
  const run = queue.then(operation, operation)
  queue = run.catch(() => {})
  return run
}

async function readIndex() {
  try {
    const raw = await fsp.readFile(INDEX_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.batches)) return { version: 1, batches: [] }
    return parsed
  } catch {
    return { version: 1, batches: [] }
  }
}

async function writeIndex(index) {
  await fsp.mkdir(INDEX_DIR, { recursive: true })
  const sorted = [...index.batches].sort((a, b) => b.createdAt - a.createdAt).slice(0, MAX_BATCHES)
  const payload = JSON.stringify({ version: 1, batches: sorted }, null, 2)
  const temp = `${INDEX_PATH}.${process.pid}.tmp`
  await fsp.writeFile(temp, payload, 'utf8')
  try {
    await fsp.rename(temp, INDEX_PATH)
  } catch {
    await fsp.rm(INDEX_PATH, { force: true })
    await fsp.rename(temp, INDEX_PATH)
  }
}

async function exists(target) {
  try {
    await fsp.lstat(target)
    return true
  } catch {
    return false
  }
}

async function moveOne(source, destination) {
  await fsp.mkdir(path.dirname(destination), { recursive: true })
  if (await exists(destination)) throw new Error(`目标已存在：${destination}`)
  try {
    await fsp.rename(source, destination)
  } catch (error) {
    if (error && error.code === 'EXDEV') {
      await fsp.copyFile(source, destination)
      await fsp.unlink(source)
      return
    }
    throw error
  }
}

function batchId() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
  return `${stamp}-${crypto.randomBytes(4).toString('hex')}`
}

function cleanRelative(relativePath, fallbackName) {
  const normalized = String(relativePath || fallbackName || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
  const parts = normalized.split('/').filter((part) => part && part !== '.' && part !== '..')
  if (parts.length === 0) return path.basename(fallbackName || 'file')
  return path.join(...parts)
}

/**
 * Move an approved list of files into per-account quarantine folders.
 * All-or-nothing: a failed move restores every file already moved.
 */
export async function moveToTrash(files, options = {}) {
  return withLock(async () => {
    if (!Array.isArray(files) || files.length === 0) throw new Error('没有可清理的文件')
    const id = batchId()
    const createdAt = Date.now()
    const accounts = new Map()
    const moves = []

    try {
      for (const file of files) {
        const accountDir = path.resolve(file.accountDir)
        const source = path.resolve(file.path)
        const relative = cleanRelative(file.relativePath, file.name)
        const trashDir = path.join(accountDir, TRASH_FOLDER, 'trash', id)
        const destination = path.join(trashDir, relative)
        if (!source.toLowerCase().startsWith(accountDir.toLowerCase() + path.sep)) {
          throw new Error(`文件不在微信账号目录内：${source}`)
        }
        if (!accounts.has(accountDir)) {
          accounts.set(accountDir, {
            accountId: file.accountId,
            accountName: file.accountName,
            accountDir,
            trashDir,
            items: [],
          })
        }
        const account = accounts.get(accountDir)
        const item = {
          name: file.name,
          originalPath: source,
          trashPath: destination,
          relativePath: relative,
          size: file.size,
          mtimeMs: file.mtimeMs,
        }
        await moveOne(source, destination)
        moves.push({ source, destination })
        account.items.push(item)
      }
    } catch (error) {
      for (const move of [...moves].reverse()) {
        try {
          await moveOne(move.destination, move.source)
        } catch {
          // Best-effort rollback; the original failure is what the user sees.
        }
      }
      for (const account of accounts.values()) {
        try {
          await fsp.rm(account.trashDir, { recursive: true, force: true })
        } catch {
          // Best effort.
        }
      }
      throw error
    }

    const accountEntries = []
    try {
      for (const account of accounts.values()) {
        const manifest = {
          batchId: id,
          createdAt,
          accountId: account.accountId,
          accountName: account.accountName,
          accountDir: account.accountDir,
          items: account.items,
        }
        await fsp.mkdir(account.trashDir, { recursive: true })
        await fsp.writeFile(
          path.join(account.trashDir, 'manifest.json'),
          JSON.stringify(manifest, null, 2),
          'utf8',
        )
        accountEntries.push({
          accountId: account.accountId,
          accountName: account.accountName,
          accountDir: account.accountDir,
          trashDir: account.trashDir,
          fileCount: account.items.length,
          bytes: account.items.reduce((sum, item) => sum + item.size, 0),
        })
      }

      const entry = {
        id,
        createdAt,
        fileCount: accountEntries.reduce((sum, item) => sum + item.fileCount, 0),
        bytes: accountEntries.reduce((sum, item) => sum + item.bytes, 0),
        accounts: accountEntries,
        files: files.map((file) => ({
          name: file.name,
          size: file.size,
          accountName: file.accountName,
        })),
      }
      const index = await readIndex()
      index.batches = [entry, ...index.batches.filter((batch) => batch.id !== id)]
      await writeIndex(index)
      return entry
    } catch (error) {
      for (const move of [...moves].reverse()) {
        try {
          await moveOne(move.destination, move.source)
        } catch {
          // Best effort.
        }
      }
      for (const account of accounts.values()) {
        try {
          await fsp.rm(account.trashDir, { recursive: true, force: true })
        } catch {
          // Best effort.
        }
      }
      throw error
    }
  })
}

/** List quarantine batches that still have manifest-backed content. */
export async function listTrash() {
  const index = await readIndex()
  const batches = []
  for (const entry of index.batches) {
    const accounts = []
    for (const account of entry.accounts || []) {
      if (!(await exists(account.trashDir))) continue
      if (!(await exists(path.join(account.trashDir, 'manifest.json')))) continue
      accounts.push(account)
    }
    if (accounts.length === 0) continue
    batches.push({
      ...entry,
      accounts,
      fileCount: accounts.reduce((sum, item) => sum + (item.fileCount || 0), 0),
      bytes: accounts.reduce((sum, item) => sum + (item.bytes || 0), 0),
    })
  }
  return batches
}

/** Restore one batch, skipping any destination that now exists. */
export async function restoreBatch(id) {
  return withLock(async () => {
    const index = await readIndex()
    const entry = index.batches.find((batch) => batch.id === id)
    if (!entry) throw new Error('找不到该清理批次')
    const remainingAccounts = []
    const restoredFiles = []
    const conflicts = []
    const errors = []

    for (const account of entry.accounts || []) {
      let manifest
      try {
        manifest = JSON.parse(await fsp.readFile(path.join(account.trashDir, 'manifest.json'), 'utf8'))
      } catch {
        continue
      }
      const remaining = []
      for (const item of manifest.items || []) {
        if (!(await exists(item.trashPath))) continue
        if (await exists(item.originalPath)) {
          conflicts.push({ name: item.name, path: item.originalPath })
          remaining.push(item)
          continue
        }
        try {
          await moveOne(item.trashPath, item.originalPath)
          restoredFiles.push({ name: item.name, path: item.originalPath })
        } catch (error) {
          errors.push({ name: item.name, message: error instanceof Error ? error.message : String(error) })
          remaining.push(item)
        }
      }
      if (remaining.length === 0) {
        try {
          await fsp.rm(account.trashDir, { recursive: true, force: true })
        } catch {
          // Best effort.
        }
      } else {
        manifest.items = remaining
        try {
          await fsp.writeFile(
            path.join(account.trashDir, 'manifest.json'),
            JSON.stringify(manifest, null, 2),
            'utf8',
          )
        } catch (error) {
          errors.push({ name: 'manifest.json', message: error instanceof Error ? error.message : String(error) })
        }
        remainingAccounts.push({
          ...account,
          fileCount: remaining.length,
          bytes: remaining.reduce((sum, item) => sum + item.size, 0),
        })
      }
    }

    if (remainingAccounts.length === 0) {
      index.batches = index.batches.filter((batch) => batch.id !== id)
    } else {
      entry.accounts = remainingAccounts
      entry.fileCount = remainingAccounts.reduce((sum, item) => sum + item.fileCount, 0)
      entry.bytes = remainingAccounts.reduce((sum, item) => sum + item.bytes, 0)
      index.batches = index.batches.map((batch) => (batch.id === id ? entry : batch))
    }
    await writeIndex(index)

    return {
      batchId: id,
      restored: restoredFiles.length,
      files: restoredFiles,
      conflicts,
      errors,
      remaining: remainingAccounts.reduce((sum, item) => sum + item.fileCount, 0),
    }
  })
}

export async function trashIndexPath() {
  return INDEX_PATH
}
