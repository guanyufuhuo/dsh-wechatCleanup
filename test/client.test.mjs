import assert from 'node:assert/strict'
import { test } from 'node:test'

test('client bundle registers the settings page and icon', async () => {
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
    useState(initial) {
      return [typeof initial === 'function' ? initial() : initial, () => {}]
    },
    useEffect() {},
    useMemo(fn) { return fn() },
    useRef(value) { return { current: value } },
    useCallback(fn) { return fn },
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
      register(options, Component) {
        registrations.push({ options, Component })
        return () => {}
      },
    },
    effect(fn) { return fn() },
  }

  await import('../client.js')
  assert.equal(definition.id, 'dsh-wechat-file-cleaner')
  const plugin = definition.factory(() => React)
  assert.deepEqual(plugin.inject, ['slots', 'locale'])
  plugin.apply(ctx)

  const section = registrations.find((entry) => entry.options.name === 'settings.section')
  const icon = registrations.find((entry) => entry.options.name === 'settings.section.icon')
  assert.ok(section)
  assert.ok(icon)
  assert.equal(section.options.id, 'wechat-file-cleaner')
  assert.equal(typeof section.options.label(), 'string')

  const wrapper = section.Component({ close() {} })
  const page = wrapper.type(wrapper.props)
  assert.equal(page.type, 'div')

  const text = []
  const visit = (node) => {
    if (node === null || node === undefined) return
    if (typeof node === 'string' || typeof node === 'number') { text.push(String(node)); return }
    if (Array.isArray(node)) { node.forEach(visit); return }
    if (typeof node.type === 'function' && !['Dialog', 'TrashDialog'].includes(node.type.name)) {
      visit(node.type(node.props))
      return
    }
    if (node.children) node.children.forEach(visit)
  }
  visit(page)
  assert.ok(text.includes('微信文件清理'))
  assert.ok(text.includes('重复 / 相似'))
  assert.ok(text.includes('大文件'))
  assert.ok(text.includes('回收站'))
  assert.ok(text.some((value) => value === '扫描' || value === '重新扫描'))
  assert.ok(!text.some((value) => value.includes('undefined')))

  const iconWrapper = icon.Component({ size: 18, active: false })
  const svg = iconWrapper.type(iconWrapper.props)
  assert.equal(svg.type, 'svg')
})
