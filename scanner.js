/**
 * WeChat file discovery, exact-duplicate hashing, and version-similarity
 * clustering. Read-only: this module never deletes or moves anything.
 */
import { promises as fsp, createReadStream } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'

const MIN_BYTES = 32 * 1024
const MAX_FILES = 30000
const MAX_HASH_BYTES = 512 * 1024 * 1024
const MAX_DEPTH = 8
const MAX_GROUPS = 300

const SKIP_DIRS = new Set([
  'cache', 'temp', 'tmp', 'db_storage', 'node_modules', '.git',
  '.dsh-wechat-cleaner', 'applet', 'wmpf',
])
const SKIP_NAMES = new Set(['thumbs.db', '.ds_store', 'desktop.ini'])
const SKIP_EXT = new Set([
  '.tmp', '.part', '.download', '.crdownload', '.lock', '.db',
  '.db-wal', '.db-shm', '.sqlite', '.sqlite-wal', '.sqlite-shm',
])
const SKIP_SUFFIXES = [
  '_thumb.jpg', '_thumb.jpeg', '_thumb.png', '_thumb.webp',
  '_raw.mp4', '_raw.mov', '_raw.avi', '_raw.mkv',
]

function sha1(value) {
  return crypto.createHash('sha1').update(value).digest('hex')
}

async function isDir(target) {
  try {
    return (await fsp.stat(target)).isDirectory()
  } catch {
    return false
  }
}

async function readDirSafe(target, warnings) {
  try {
    return await fsp.readdir(target, { withFileTypes: true })
  } catch (error) {
    if (error && (error.code === 'ENOENT' || error.code === 'EACCES' || error.code === 'EPERM')) {
      if (error.code !== 'ENOENT') warnings.push(`无法读取目录：${target}`)
      return []
    }
    warnings.push(`读取目录失败：${target}`)
    return []
  }
}

function cleanAccountName(folderName) {
  const match = /^(wxid_[0-9a-z]+)(?:_[0-9a-f]{4})?$/i.exec(folderName)
  if (match) return match[1]
  return folderName
}

async function isAccountDirectory(target) {
  if (await isDir(path.join(target, 'msg'))) return true
  if (await isDir(path.join(target, 'FileStorage'))) return true
  return false
}

async function rootsFromWechatConfig() {
  const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming')
  const configDir = path.join(appData, 'Tencent', 'xwechat', 'config')
  const found = []
  let entries
  try {
    entries = await fsp.readdir(configDir, { withFileTypes: true })
  } catch {
    return found
  }
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.ini')) continue
    try {
      const text = await fsp.readFile(path.join(configDir, entry.name), 'utf8')
      for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim().replace(/^"|"$/g, '')
        if (!/^[a-zA-Z]:[\\/]/.test(line) && !line.startsWith('\\\\')) continue
        if (!(await isDir(line))) continue
        if (path.basename(line).toLowerCase() === 'xwechat_files') {
          found.push(line)
        } else if (await isDir(path.join(line, 'xwechat_files'))) {
          found.push(path.join(line, 'xwechat_files'))
        }
      }
    } catch {
      // A locked or half-written config file must not block discovery.
    }
  }
  return found
}

/**
 * Resolve WeChat storage roots. An explicit root wins; otherwise the WeChat 4
 * config files, Documents, and OneDrive Documents are probed.
 */
export async function discoverRoots(extraRoot) {
  const roots = []
  const seen = new Set()
  const add = async (candidate, source) => {
    if (!candidate || typeof candidate !== 'string') return
    const resolved = path.resolve(candidate.trim().replace(/^"|"$/g, ''))
    const key = resolved.toLowerCase()
    if (seen.has(key)) return
    if (!(await isDir(resolved))) return
    seen.add(key)
    roots.push({ path: resolved, source })
  }

  if (extraRoot && String(extraRoot).trim()) {
    const resolved = path.resolve(String(extraRoot).trim().replace(/^"|"$/g, ''))
    const nested = path.join(resolved, 'xwechat_files')
    if (await isDir(nested)) await add(nested, 'custom')
    else await add(resolved, 'custom')
    return roots
  }

  for (const candidate of await rootsFromWechatConfig()) await add(candidate, 'wechat-config')

  const home = os.homedir()
  const documents = [
    path.join(home, 'Documents'),
    path.join(home, 'OneDrive', 'Documents'),
    path.join(home, 'OneDrive - Personal', 'Documents'),
  ]
  for (const doc of documents) {
    await add(path.join(doc, 'WeChat Files'), 'documents')
    await add(path.join(doc, 'xwechat_files'), 'documents')
  }
  await add(path.join(home, 'WeChat Files'), 'home')

  // macOS WeChat containers. WeChat 4 keeps xwechat_files under the app's
  // Documents directory; older builds keep WeChat Files beside it.
  const macBases = [
    path.join(home, 'Library', 'Containers', 'com.tencent.xinWeChat', 'Data', 'Documents'),
    path.join(home, 'Library', 'Containers', 'com.tencent.xinWeChat', 'Data', 'Library', 'Application Support', 'com.tencent.xinWeChat'),
    path.join(home, 'Library', 'Application Support', 'com.tencent.xinWeChat'),
  ]
  for (const base of macBases) {
    await add(path.join(base, 'xwechat_files'), 'macos')
    await add(path.join(base, 'WeChat Files'), 'macos')
  }
  return roots
}

/**
 * Discover per-account folders inside the resolved roots. WeChat 4 accounts
 * contain `msg`; WeChat 3 accounts contain `FileStorage`.
 */
export async function discoverAccounts(roots, warnings = []) {
  const accounts = []
  const seen = new Set()

  const addAccount = (dir, root) => {
    const key = dir.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    const folderName = path.basename(dir)
    const shortName = cleanAccountName(folderName)
    const suffix = shortName === folderName ? '' : folderName.slice(shortName.length + 1)
    accounts.push({
      id: sha1(key).slice(0, 12),
      dir,
      root,
      folderName,
      displayName: suffix ? `${shortName} (${suffix})` : folderName,
    })
  }

  for (const root of roots) {
    if (await isAccountDirectory(root.path)) {
      addAccount(root.path, root.path)
      continue
    }
    const entries = await readDirSafe(root.path, warnings)
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const lower = entry.name.toLowerCase()
      if (lower === 'all_users' || lower === 'backup') continue
      if (lower.startsWith('.')) continue
      const dir = path.join(root.path, entry.name)
      if (!(await isAccountDirectory(dir))) continue
      addAccount(dir, root.path)
    }
  }

  accounts.sort((a, b) => a.displayName.localeCompare(b.displayName, 'zh-CN'))
  return accounts
}

function normalizeStem(fileName) {
  const ext = path.extname(fileName)
  let stem = fileName.slice(0, fileName.length - ext.length).normalize('NFKC').toLowerCase().trim()
  stem = stem.replace(/^\d{1,3}[.、]\s*/, '')
  for (let i = 0; i < 3; i += 1) {
    const before = stem
    stem = stem.replace(/(?:\s*[（(]\s*\d{1,3}\s*[)）]\s*)+$/g, '')
    stem = stem.replace(/(?:\s*[-_·]?\s*(?:副本|复件|备份|copy|backup)\s*\d{0,3}\s*)+$/gi, '')
    stem = stem.replace(/(?:\s*[-_]\s*\d{1,3})$/g, '')
    if (stem === before) break
  }
  stem = stem.replace(/[\s\-_]+/g, ' ').trim()
  return stem
}

function isSkippedFile(name) {
  const lower = name.toLowerCase()
  if (SKIP_NAMES.has(lower)) return true
  if (SKIP_EXT.has(path.extname(lower))) return true
  return SKIP_SUFFIXES.some((suffix) => lower.endsWith(suffix))
}

async function walkArea(dir, account, state) {
  if (state.truncated) return
  const entries = await readDirSafe(dir, state.warnings)
  for (const entry of entries) {
    if (state.files.length >= state.maxFiles) {
      state.truncated = true
      return
    }
    if (entry.isSymbolicLink()) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const lower = entry.name.toLowerCase()
      if (lower.startsWith('.') || SKIP_DIRS.has(lower)) continue
      if (state.walkDepth >= MAX_DEPTH) continue
      state.walkDepth += 1
      await walkArea(full, account, state)
      state.walkDepth -= 1
      if (state.truncated) return
      continue
    }
    if (!entry.isFile()) continue
    if (isSkippedFile(entry.name)) {
      state.skippedName += 1
      continue
    }
    let stat
    try {
      stat = await fsp.stat(full)
    } catch {
      state.skippedName += 1
      continue
    }
    if (!stat.isFile()) continue
    if (stat.size < state.minBytes) {
      state.skippedSmall += 1
      continue
    }
    state.files.push({
      id: sha1(full.toLowerCase()).slice(0, 16),
      path: full,
      name: entry.name,
      ext: path.extname(entry.name).toLowerCase(),
      stem: normalizeStem(entry.name),
      size: stat.size,
      mtimeMs: stat.mtimeMs,
      accountId: account.id,
      accountName: account.displayName,
      accountDir: account.dir,
      relativePath: path.relative(account.dir, full),
    })
  }
}

async function hashFile(file) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = createReadStream(file.path, { highWaterMark: 1024 * 1024 })
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(hash.digest('hex')))
  })
}

async function mapLimit(items, limit, worker) {
  const output = new Array(items.length)
  let cursor = 0
  const count = Math.max(1, Math.min(limit, items.length))
  await Promise.all(Array.from({ length: count }, async () => {
    while (true) {
      const index = cursor
      cursor += 1
      if (index >= items.length) return
      output[index] = await worker(items[index], index)
    }
  }))
  return output
}

class UnionFind {
  constructor(ids) {
    this.parent = new Map(ids.map((id) => [id, id]))
    this.rank = new Map(ids.map((id) => [id, 0]))
  }

  find(id) {
    let current = id
    while (this.parent.get(current) !== current) {
      this.parent.set(current, this.parent.get(this.parent.get(current)))
      current = this.parent.get(current)
    }
    return current
  }

  union(a, b) {
    const rootA = this.find(a)
    const rootB = this.find(b)
    if (rootA === rootB) return
    const rankA = this.rank.get(rootA) || 0
    const rankB = this.rank.get(rootB) || 0
    if (rankA < rankB) {
      this.parent.set(rootA, rootB)
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA)
    } else {
      this.parent.set(rootB, rootA)
      this.rank.set(rootA, rankA + 1)
    }
  }
}

function keepNewest(files) {
  return [...files].sort((a, b) => {
    if (b.mtimeMs !== a.mtimeMs) return b.mtimeMs - a.mtimeMs
    if (b.size !== a.size) return b.size - a.size
    return a.path.length - b.path.length
  })
}

function publicGroup(component, hashByPath) {
  const sorted = keepNewest(component)
  const keep = sorted[0]
  const hashes = sorted.map((file) => hashByPath.get(file.path)).filter(Boolean)
  const exact = hashes.length === sorted.length && new Set(hashes).size === 1
  const id = sha1(sorted.map((file) => file.id).sort().join('|')).slice(0, 12)
  const files = sorted.map((file, index) => ({
    id: file.id,
    name: file.name,
    path: file.path,
    relativePath: file.relativePath,
    ext: file.ext,
    size: file.size,
    mtimeMs: file.mtimeMs,
    accountId: file.accountId,
    accountName: file.accountName,
    accountDir: file.accountDir,
    suggestedDelete: index > 0,
  }))
  const potentialBytes = files.reduce((sum, file, index) => (index === 0 ? sum : sum + file.size), 0)
  return {
    id,
    kind: exact ? 'exact' : 'similar',
    title: keep.name,
    extension: keep.ext,
    accountId: keep.accountId,
    accountName: keep.accountName,
    fileCount: files.length,
    size: keep.size,
    potentialBytes,
    files,
  }
}

/**
 * Scan WeChat storage roots and return account-scoped duplicate/similar groups.
 * Every group keeps at least one file and marks a default removal suggestion.
 */
export async function scanWeChat(options = {}) {
  const warnings = []
  const started = Date.now()
  const minBytes = Number.isFinite(options.minBytes) ? Math.max(1, options.minBytes) : MIN_BYTES
  const maxFiles = Number.isFinite(options.maxFiles) ? Math.max(1, options.maxFiles) : MAX_FILES
  const roots = await discoverRoots(options.extraRoot)
  const accounts = await discoverAccounts(roots, warnings)

  if (accounts.length === 0) {
    return {
      roots: roots.map((root) => ({ path: root.path, source: root.source, accountCount: 0 })),
      accounts: [],
      groups: [],
      totalFiles: 0,
      totalBytes: 0,
      groupCount: 0,
      exactGroups: 0,
      similarGroups: 0,
      reclaimableBytes: 0,
      skippedSmall: 0,
      skippedName: 0,
      truncated: false,
      groupsTruncated: false,
      warnings,
      durationMs: Date.now() - started,
    }
  }

  const files = []
  let skippedSmall = 0
  let skippedName = 0
  let truncated = false

  for (const account of accounts) {
    const dataDirs = []
    if (await isDir(path.join(account.dir, 'msg'))) {
      dataDirs.push(path.join(account.dir, 'msg', 'file'))
      dataDirs.push(path.join(account.dir, 'msg', 'video'))
      if (options.includeAttachments) dataDirs.push(path.join(account.dir, 'msg', 'attach'))
    }
    if (await isDir(path.join(account.dir, 'FileStorage'))) {
      dataDirs.push(path.join(account.dir, 'FileStorage', 'File'))
      dataDirs.push(path.join(account.dir, 'FileStorage', 'Video'))
      dataDirs.push(path.join(account.dir, 'FileStorage', 'Image'))
    }
    for (const dataDir of dataDirs) {
      if (!(await isDir(dataDir))) continue
      const state = { files, warnings, minBytes, maxFiles, skippedSmall, skippedName, truncated, walkDepth: 0 }
      await walkArea(dataDir, account, state)
      skippedSmall = state.skippedSmall
      skippedName = state.skippedName
      truncated = state.truncated
      if (truncated) break
    }
    if (truncated) break
  }

  // De-duplicate paths defensively (overlapping roots or account layouts).
  const uniqueByPath = new Map()
  for (const file of files) {
    if (!uniqueByPath.has(file.path.toLowerCase())) uniqueByPath.set(file.path.toLowerCase(), file)
  }
  const uniqueFiles = [...uniqueByPath.values()]

  // Hash same-size buckets only: exact duplicates must share a byte size.
  const sizeBuckets = new Map()
  for (const file of uniqueFiles) {
    const key = `${file.accountId}:${file.size}`
    if (!sizeBuckets.has(key)) sizeBuckets.set(key, [])
    sizeBuckets.get(key).push(file)
  }
  const hashTargets = []
  for (const bucket of sizeBuckets.values()) {
    if (bucket.length < 2) continue
    for (const file of bucket) {
      if (file.size <= MAX_HASH_BYTES) hashTargets.push(file)
    }
  }
  const hashByPath = new Map()
  await mapLimit(hashTargets, 4, async (file) => {
    try {
      hashByPath.set(file.path, await hashFile(file))
    } catch {
      // A file locked by WeChat stays eligible for name-based similarity.
    }
  })

  const union = new UnionFind(uniqueFiles.map((file) => file.id))
  for (const bucket of sizeBuckets.values()) {
    if (bucket.length < 2) continue
    const byHash = new Map()
    for (const file of bucket) {
      const hash = hashByPath.get(file.path)
      if (!hash) continue
      if (!byHash.has(hash)) byHash.set(hash, [])
      byHash.get(hash).push(file)
    }
    for (const same of byHash.values()) {
      for (let i = 1; i < same.length; i += 1) union.union(same[0].id, same[i].id)
    }
  }

  // Version similarity: same account + extension + normalized stem, with a
  // bounded size ratio so unrelated files that merely share a name stay apart.
  const stemBuckets = new Map()
  for (const file of uniqueFiles) {
    if (!file.stem || file.stem.length < 2) continue
    const key = `${file.accountId}|${file.ext}|${file.stem}`
    if (!stemBuckets.has(key)) stemBuckets.set(key, [])
    stemBuckets.get(key).push(file)
  }
  for (const bucket of stemBuckets.values()) {
    if (bucket.length < 2) continue
    const sorted = [...bucket].sort((a, b) => a.size - b.size)
    for (let i = 1; i < sorted.length; i += 1) {
      const left = sorted[i - 1]
      const right = sorted[i]
      const ratio = Math.min(left.size, right.size) / Math.max(left.size, right.size)
      if (ratio >= 0.45) union.union(left.id, right.id)
    }
  }

  const components = new Map()
  for (const file of uniqueFiles) {
    const root = union.find(file.id)
    if (!components.has(root)) components.set(root, [])
    components.get(root).push(file)
  }

  const groups = []
  for (const component of components.values()) {
    if (component.length < 2) continue
    groups.push(publicGroup(component, hashByPath))
  }
  groups.sort((a, b) => b.potentialBytes - a.potentialBytes || b.fileCount - a.fileCount)

  const groupsTruncated = groups.length > MAX_GROUPS
  const visibleGroups = groups.slice(0, MAX_GROUPS)
  const groupByAccount = new Map()
  for (const group of visibleGroups) {
    if (!groupByAccount.has(group.accountId)) groupByAccount.set(group.accountId, [])
    groupByAccount.get(group.accountId).push(group)
  }

  const fileByAccount = new Map()
  for (const file of uniqueFiles) {
    if (!fileByAccount.has(file.accountId)) fileByAccount.set(file.accountId, [])
    fileByAccount.get(file.accountId).push(file)
  }

  const accountSummaries = accounts.map((account) => {
    const accountFiles = fileByAccount.get(account.id) || []
    const accountGroups = groupByAccount.get(account.id) || []
    return {
      id: account.id,
      displayName: account.displayName,
      folderName: account.folderName,
      dir: account.dir,
      fileCount: accountFiles.length,
      bytes: accountFiles.reduce((sum, file) => sum + file.size, 0),
      groupCount: accountGroups.length,
      reclaimableBytes: accountGroups.reduce((sum, group) => sum + group.potentialBytes, 0),
    }
  })

  const exactGroups = visibleGroups.filter((group) => group.kind === 'exact').length
  const similarGroups = visibleGroups.length - exactGroups

  return {
    roots: roots.map((root) => ({
      path: root.path,
      source: root.source,
      accountCount: accounts.filter((account) => account.root === root.path).length,
    })),
    accounts: accountSummaries,
    groups: visibleGroups,
    totalFiles: uniqueFiles.length,
    totalBytes: uniqueFiles.reduce((sum, file) => sum + file.size, 0),
    groupCount: visibleGroups.length,
    exactGroups,
    similarGroups,
    reclaimableBytes: visibleGroups.reduce((sum, group) => sum + group.potentialBytes, 0),
    skippedSmall,
    skippedName,
    truncated,
    groupsTruncated,
    warnings: warnings.slice(0, 20),
    durationMs: Date.now() - started,
  }
}
