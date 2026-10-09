import test from 'node:test'
import assert from 'node:assert/strict'
import { componentScript, execute, Element } from './helpers/runtime.mjs'
function setup(fail = false) {
  const dialog = new Element(),
    trigger = new Element(),
    close = new Element(),
    input = new Element(),
    status = new Element()
  const keyboard = new Element()
  dialog.showModal = () => {
    dialog.open = true
  }
  dialog.close = () => {
    dialog.open = false
    dialog.dispatch('close')
  }
  dialog.querySelector = () => input
  dialog.getBoundingClientRect = () => ({ left: 10, right: 100, top: 10, bottom: 100 })
  const elements = {
    '#search-dialog': dialog,
    '#open-search': trigger,
    '#close-search': close,
    '#search-status': status,
    '#search': { dataset: { trailingSlashes: 'false' } },
  }
  let attempts = 0,
    config
  execute(
    componentScript('src/components/Search.astro')
      .replaceAll('import.meta.env.DEV', 'false')
      .replaceAll('import.meta.env.BASE_URL', "'/blog/'"),
    {
      document: {
        querySelector: (selector) => elements[selector],
        querySelectorAll: () => (dialog.open ? [dialog] : []),
        addEventListener: keyboard.addEventListener.bind(keyboard),
      },
      require: () => ({
        PagefindUI: class {
          constructor(options) {
            attempts++
            if (fail && attempts === 1) throw Error('load failed')
            config = options
          }
        },
      }),
    },
  )
  return {
    dialog,
    trigger,
    close,
    input,
    status,
    keyboard,
    attempts: () => attempts,
    config: () => config,
  }
}
test('search opens, initializes once, closes and restores trigger focus', async () => {
  const app = setup()
  await Promise.all([app.trigger.dispatch('click'), app.trigger.dispatch('click')])
  assert.equal(app.dialog.open, true)
  assert.equal(app.attempts(), 1)
  assert.equal(app.input.focused, true)
  await app.close.dispatch('click')
  assert.equal(app.dialog.open, false)
  assert.equal(app.trigger.focused, true)
  await app.trigger.dispatch('click')
  assert.equal(app.attempts(), 1)
  assert.equal(app.config().baseUrl, '/blog/')
  assert.equal(app.config().bundlePath, '/blog/pagefind/')
  const result = app.config().processResult({
    url: '/blog/posts/example/',
    sub_results: [{ url: '/blog/posts/example/#heading' }],
  })
  assert.equal(result.url, '/blog/posts/example')
  assert.equal(result.sub_results[0].url, '/blog/posts/example#heading')
})
test('search retries failed loading instead of caching rejection', async () => {
  const app = setup(true)
  await app.trigger.dispatch('click')
  assert.match(app.status.textContent, /failed to load/)
  await app.close.dispatch('click')
  await app.trigger.dispatch('click')
  assert.equal(app.attempts(), 2)
  assert.equal(app.status.textContent, '')
  assert.equal(app.input.focused, true)
})
test('search keyboard shortcut toggles the dialog and outside clicks close it', async () => {
  const app = setup()
  await app.keyboard.dispatch('keydown', { ctrlKey: true, key: 'k' })
  assert.equal(app.dialog.open, true)
  await app.keyboard.dispatch('keydown', { metaKey: true, key: 'K' })
  assert.equal(app.dialog.open, false)
  await app.trigger.dispatch('click')
  await app.dialog.dispatch('click', { clientX: 40, clientY: 40 })
  assert.equal(app.dialog.open, true)
  await app.dialog.dispatch('click', { clientX: 0, clientY: 0 })
  assert.equal(app.dialog.open, false)
})
