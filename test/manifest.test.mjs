import assert from 'node:assert/strict'
import { test } from 'node:test'
import { promises as fsp } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

async function read(relative) {
  return fsp.readFile(path.join(root, relative), 'utf8')
}

test('package manifest is publishable and complete', async () => {
  const manifest = JSON.parse(await read('package.json'))
  assert.equal(manifest.name, 'dsh-wechat-file-cleaner')
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/)
  assert.equal(manifest.private, undefined)
  assert.equal(manifest.license, 'MIT')
  assert.equal(manifest.repository.url, 'git+https://github.com/guanyufuhuo/dsh-wechatCleanup.git')
  assert.equal(manifest.homepage, 'https://github.com/guanyufuhuo/dsh-wechatCleanup#readme')
  assert.equal(manifest.publishConfig.access, 'public')
  assert.equal(manifest.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(manifest.dsh.manifestVersion, 1)
  assert.equal(manifest.dsh.client.platform, 'web')
  assert.ok(manifest.engines.dsh.includes('0.2.2-rc.1'))
  assert.ok(manifest.files.includes('LICENSE'))
  assert.ok(manifest.files.includes('cordis.patch.yml'))
  assert.ok(manifest.files.includes('locale/*.json'))
  assert.ok(manifest.files.includes('icon.svg'))
  assert.equal(manifest.exports['./icon'], './icon.svg')
  assert.equal(manifest.scripts.test, 'node --test "test/*.test.mjs"')
})

test('bundle patch and browser module use the package name', async () => {
  const manifest = JSON.parse(await read('package.json'))
  const patch = await read('cordis.patch.yml')
  const client = await read('client.js')
  assert.ok(patch.includes(`name: '${manifest.name}'`))
  assert.ok(client.includes(`id: '${manifest.name}'`))
  assert.ok(!patch.includes('@local/'))
  assert.ok(!client.includes('@local/'))
})

test('localized metadata and icon are present', async () => {
  for (const locale of ['en', 'zh']) {
    const meta = JSON.parse(await read(`locale/${locale}.json`))
    assert.ok(meta.meta.title.length > 0)
    assert.ok(meta.meta.description.length > 20)
  }
  const icon = await fsp.stat(path.join(root, 'icon.svg'))
  assert.ok(icon.size > 100)
  assert.ok(icon.size < 256 * 1024)
  const svg = await read('icon.svg')
  assert.match(svg, /^<svg[\s>]/)
})

test('release documents exist', async () => {
  for (const file of ['README.md', 'CHANGELOG.md', 'LICENSE', 'SECURITY.md']) {
    const content = await read(file)
    assert.ok(content.trim().length > 50)
  }
})
