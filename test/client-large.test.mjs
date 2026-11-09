import assert from 'node:assert/strict'
import { test } from 'node:test'

test('renders the large-file scan tab with filters and grouped results', async () => {
  let definition
  globalThis.window = {
    __ModuleLoader__: { load(value) { definition = value } },
    setTimeout,
    clearTimeout,
  }

  const React = {
    createElement(type, props, ...children) {
      return { type, props: props || {}, children: children.flat(Infinity) }
    },
    useEffect() {},
    useMemo(fn) { return fn() },
    useRef(value) { return { current: value } },
    useCallback(fn) { return fn },
  }

  const now = Date.now()
  const largeScan = {
    scanId: 'scan-large',
    createdAt: now,
    mode: 'large',
    roots: [{ path: 'D:\\weixin Storage\\xwechat_files', source: 'wechat-config', accountCount: 1 }],
    accounts: [{
      id: 'acct-1',
      displayName: 'wxid_demo (abcd)',
      folderName: 'wxid_demo_abcd',
      dir: 'D:\\weixin Storage\\xwechat_files\\wxid_demo_abcd',
      fileCount: 2,
      bytes: 350_000_000,
      groupCount: 1,
      reclaimableBytes: 0,
    }],
    groups: [{
      id: 'group-large',
      kind: 'large',
      title: 'wxid_demo (abcd)',
      extension: '',
      accountId: 'acct-1',
      accountName: 'wxid_demo (abcd)',
      fileCount: 2,
      size: 300_000_000,
      potentialBytes: 350_000_000,
      files: [
        {
          id: 'file-1', name: 'movie.mp4', path: 'D:\\weixin Storage\\xwechat_files\\wxid_demo_abcd\\msg\\video\\movie.mp4',
          relativePath: 'msg\\video\\movie.mp4', ext: '.mp4', size: 300_000_000, mtimeMs: now,
          accountId: 'acct-1', accountName: 'wxid_demo (abcd)', suggestedDelete: false,
        },
        {
          id: 'file-2', name: 'archive.zip', path: 'D:\\weixin Storage\\xwechat_files\\wxid_demo_abcd\\msg\\file\\archive.zip',
          relativePath: 'msg\\file\\archive.zip', ext: '.zip', size: 50_000_000, mtimeMs: now,
          accountId: 'acct-1', accountName: 'wxid_demo (abcd)', suggestedDelete: false,
        },
      ],
    }],
    totalFiles: 2,
    totalBytes: 350_000_000,
    groupCount: 1,
    exactGroups: 0,
    similarGroups: 0,
    reclaimableBytes: 0,
    skippedSmall: 0,
    skippedName: 0,
    skippedFilter: 4,
    thresholdBytes: 100 * 1024 * 1024,
    extensions: ['mp4', 'zip'],
    truncated: false,
    groupsTruncated: false,
    warnings: [],
    durationMs: 42,
  }

  const initialStates = [
    0, null, false, '', '', '', new Set(), 'large', largeScan, false,
    '', '100', 'mp4, zip', new Set(), 'all', false, null, false, false,
    false, '', null, false, null, false, '',
  ]
  let stateIndex = 0
  React.useState = (initial) => {
    const value = stateIndex < initialStates.length
      ? initialStates[stateIndex]
      : (typeof initial === 'function' ? initial() : initial)
    stateIndex += 1
    return [value, () => {}]
  }

  const registrations = []
  const locale = {
    getSnapshot() { return { active: 'zh', locales: [], revision: 1 } },
    subscribe() { return () => {} },
    register() { return () => {} },
  }
  const ctx = {
    locale,
    slots: {
      inject(key, callback) { callback() },
      register(options, Component) { registrations.push({ options, Component }); return () => {} },
    },
    effect(fn) { return fn() },
  }

  await import('../client.js')
  const plugin = definition.factory(() => React)
  plugin.apply(ctx)
  const section = registrations.find((entry) => entry.options.name === 'main')
  const wrapper = section.Component({})
  const page = wrapper.type(wrapper.props)

  const text = []
  const visit = (node) => {
    if (node === null || node === undefined) return
    if (typeof node === 'string' || typeof node === 'number') { text.push(String(node)); return }
    if (Array.isArray(node)) { node.forEach(visit); return }
    if (typeof node.type === 'function') {
      if (['Dialog', 'TrashDialog'].includes(node.type.name)) return
      visit(node.type(node.props))
      return
    }
    if (node.children) node.children.forEach(visit)
  }
  visit(page)

  assert.ok(text.includes('大文件扫描'))
  assert.ok(text.includes('最小大小'))
  assert.ok(text.includes('后缀名筛选'))
  assert.ok(text.includes('movie.mp4'))
  assert.ok(text.includes('archive.zip'))
  assert.ok(text.includes('全选'))
  assert.ok(text.some((value) => value.includes('阈值 100 MB')))
  assert.ok(text.some((value) => value.includes('已按后缀过滤 4 个文件')))
  assert.ok(!text.some((value) => value.includes('undefined')))
  assert.ok(stateIndex >= 26, `used ${stateIndex} state slots`)
})
