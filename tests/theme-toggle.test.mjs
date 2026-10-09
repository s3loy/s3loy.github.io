import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'
const root = process.env.BLOG_ROOT || process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const script = (file) => read(file).match(/<script[^>]*>([\s\S]*?)<\/script>/)[1]
function setup(saved, reduced = false, blocked = false) {
  const classes = new Set()
  const html = {
    dataset: { theme: 'github-dark' },
    style: {},
    classList: {
      add: (value) => classes.add(value),
      remove: (value) => classes.delete(value),
    },
  }
  const events = {}
  const attributes = {}
  const button = {
    disabled: true,
    textContent: '',
    setAttribute: (key, value) => {
      attributes[key] = value
    },
    addEventListener: (key, callback) => {
      events[key] = callback
    },
  }
  const timers = new Map()
  let serial = 0
  const state = { saved }
  const context = vm.createContext({
    document: { documentElement: html, querySelector: () => button },
    localStorage: {
      getItem: () => {
        if (blocked) throw Error('blocked')
        return state.saved
      },
      setItem: (_, value) => {
        if (blocked) throw Error('blocked')
        state.saved = value
      },
    },
    matchMedia: () => ({ matches: reduced }),
    setTimeout: (callback) => {
      timers.set(++serial, callback)
      return serial
    },
    clearTimeout: (id) => timers.delete(id),
  })
  vm.runInContext(script('src/components/SelectThemeLoader.astro'), context)
  vm.runInContext(ts.transpile(script('src/components/SelectTheme.astro')), context)
  return { html, button, events, attributes, classes, timers, state }
}
test('only the light and dark themes are bundled', () => {
  assert.match(read('src/site.config.ts'), /include: \['github-light', 'github-dark'\]/)
  assert.doesNotMatch(read('src/components/SelectTheme.astro'), /<select|<option/)
})
test('old variants migrate and two clicks return to the original theme', () => {
  const app = setup('github-light-high-contrast')
  assert.equal(app.html.dataset.theme, 'github-light')
  assert.equal(app.attributes['aria-label'], 'Switch to dark theme')
  app.events.click()
  assert.equal(app.html.dataset.theme, 'github-dark')
  assert.equal(app.html.style.colorScheme, 'dark')
  assert.equal(app.state.saved, 'github-dark')
  assert.equal(app.button.textContent, 'Light')
  assert.ok(app.classes.has('theme-transition'))
  app.events.click()
  assert.equal(app.html.dataset.theme, 'github-light')
  assert.equal(app.timers.size, 1)
  app.timers.values().next().value()
  assert.equal(app.classes.size, 0)
  assert.equal(setup(app.state.saved).html.dataset.theme, 'github-light')
})
test('reduced motion and unavailable storage do not prevent toggling', () => {
  const app = setup('github-dark-dimmed', true, true)
  app.events.click()
  assert.equal(app.html.dataset.theme, 'github-light')
  assert.equal(app.classes.size, 0)
  assert.equal(app.timers.size, 0)
  assert.equal(app.button.disabled, false)
  assert.match(read('src/styles/global.css'), /background-color 280ms ease/)
  assert.match(read('src/styles/global.css'), /prefers-reduced-motion: reduce/)
})
