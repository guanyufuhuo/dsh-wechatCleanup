import assert from 'node:assert/strict'
import { test } from 'node:test'
import { promises as fsp } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { scanLargeFiles, scanWeChat } from '../scanner.js'

const payload = 'A'.repeat(100_000)

async function fixture() {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'dsh-wfc-scan-'))
  const a = path.join(root, 'wxid_a_1111', 'msg', 'file', '2026-01')
  const b = path.join(root, 'wxid_b_2222', 'msg', 'video', '2026-01')
  await fsp.mkdir(a, { recursive: true })
  await fsp.mkdir(b, { recursive: true })
  await fsp.writeFile(path.join(a, '报告.docx'), `${payload}V1`)
  await fsp.writeFile(path.join(a, '报告(1).docx'), `${payload}V1`)
  await fsp.writeFile(path.join(a, '报告(2).docx'), `${payload}V2`)
  await fsp.writeFile(path.join(a, '独有.pdf'), 'P'.repeat(60_000))
  await fsp.writeFile(path.join(a, '报告_thumb.jpg'), `${payload}V1`)
  await fsp.writeFile(path.join(a, 'clip_raw.mp4'), `${payload}V1`)
  await fsp.writeFile(path.join(a, 'note.txt'), 'small')
  await fsp.writeFile(path.join(b, 'clip.mp4'), 'B'.repeat(90_000))
  await fsp.writeFile(path.join(b, 'clip(1).mp4'), 'B'.repeat(90_000))
  return root
}

test('discovers accounts and groups exact and similar files without derived artefacts', async (t) => {
  const root = await fixture()
  t.after(() => fsp.rm(root, { recursive: true, force: true }))

  const result = await scanWeChat({ extraRoot: root })
  assert.equal(result.accounts.length, 2)
  assert.equal(result.groups.length, 2)
  assert.equal(result.exactGroups, 1)
  assert.equal(result.similarGroups, 1)
  assert.equal(result.totalFiles, 6)

  const names = result.groups.flatMap((group) => group.files.map((file) => file.name))
  assert.ok(!names.includes('报告_thumb.jpg'))
  assert.ok(!names.includes('clip_raw.mp4'))
  assert.ok(!names.includes('note.txt'))

  const docGroup = result.groups.find((group) => group.title.startsWith('报告'))
  assert.equal(docGroup.kind, 'similar')
  assert.equal(docGroup.files.length, 3)
  assert.equal(docGroup.files.filter((file) => file.suggestedDelete).length, 2)

  const videoGroup = result.groups.find((group) => group.title.startsWith('clip'))
  assert.equal(videoGroup.kind, 'exact')
  assert.equal(videoGroup.files.length, 2)
  assert.equal(videoGroup.files.filter((file) => file.suggestedDelete).length, 1)

  assert.ok(result.groups.every((group) => group.files.every((file) => file.accountId === group.accountId)))
  assert.ok(result.accounts.every((account) => account.displayName.includes('wxid_')))
})

test('returns an empty result for a folder without account data', async (t) => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'dsh-wfc-empty-'))
  t.after(() => fsp.rm(root, { recursive: true, force: true }))
  const result = await scanWeChat({ extraRoot: root })
  assert.equal(result.accounts.length, 0)
  assert.equal(result.groups.length, 0)
  assert.equal(result.totalFiles, 0)
})

test('finds files above a threshold and filters by extension', async (t) => {
  const root = await fixture()
  t.after(() => fsp.rm(root, { recursive: true, force: true }))

  const above95k = await scanLargeFiles({ extraRoot: root, minBytes: 95_000 })
  assert.equal(above95k.mode, 'large')
  assert.equal(above95k.totalFiles, 3)
  assert.equal(above95k.accounts.length, 2)
  assert.equal(above95k.groups.length, 1)
  assert.ok(above95k.groups[0].files.every((file) => file.size >= 95_000))
  assert.ok(above95k.groups[0].files.every((file) => file.suggestedDelete === false))
  assert.ok(above95k.groups[0].files[0].size >= above95k.groups[0].files[1].size)

  const videos = await scanLargeFiles({ extraRoot: root, minBytes: 50_000, extensions: ['mp4'] })
  assert.equal(videos.mode, 'large')
  assert.equal(videos.totalFiles, 2)
  assert.equal(videos.groups.length, 1)
  assert.ok(videos.groups[0].files.every((file) => file.name.endsWith('.mp4')))

  const none = await scanLargeFiles({ extraRoot: root, minBytes: 2_000_000 })
  assert.equal(none.totalFiles, 0)
  assert.equal(none.groups.length, 0)
})
