import test from 'node:test'
import assert from 'node:assert/strict'
import { read, execute, Element } from './helpers/runtime.mjs'

test('actual Mermaid renderer binds the viewer after SVG production and again after theme rendering', async () => {
  const block = new Element(),
    button = new Element(),
    label = new Element()
  block.textContent = 'sequenceDiagram\nA->>B: Hello'
  block.style.removeProperty = () => {}
  block.getBoundingClientRect = () => ({ height: 120 })
  block.parentElement = {
    classList: { contains: () => true, toggle() {} },
    querySelector: (selector) => (selector === 'button' ? button : label),
  }
  let svg = null,
    bindings = 0,
    runs = 0,
    observer,
    namespaced = 0
  block.querySelector = () => svg
  const api = execute(read('src/scripts/mermaid.ts'), {
    console: {
      debug() {},
      error: (...values) => {
        throw Error(values.join(' '))
      },
    },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    document: {
      fonts: { ready: Promise.resolve() },
      readyState: 'complete',
      documentElement: {},
      querySelectorAll: () => [block],
    },
    MutationObserver: class {
      constructor(callback) {
        observer = callback
      }
      observe() {}
    },
    require: (name) =>
      ({
        './media-viewer': {
          setupMediaViewer: () => {
            assert.ok(svg)
            bindings++
            block.dataset.mediaBound = 'true'
          },
          openMediaViewer() {},
        },
        './svg-ids': {
          namespaceSVG: () => {
            namespaced++
          },
        },
        mermaid: {
          default: {
            initialize() {},
            run: async () => {
              runs++
              svg = {}
            },
          },
        },
      })[name],
  })
  api.setupMermaid()
  await new Promise(setImmediate)
  assert.equal(runs, 1)
  assert.equal(bindings, 1)
  assert.equal(namespaced, 1)
  assert.equal(block.dataset.mediaBound, 'true')
  assert.equal(block.dataset.mermaidRendered, 'true')
  assert.equal(block.getAttribute('aria-busy'), null)
  assert.equal(button.disabled, false)
  observer([{ type: 'attributes', attributeName: 'data-theme' }])
  await new Promise(setImmediate)
  assert.equal(runs, 2)
  assert.equal(bindings, 2)
  assert.equal(namespaced, 2)
})

test('Mermaid disables its automatic window-load renderer before waiting for fonts', () => {
  let initialized = false
  const api = execute(read('src/scripts/mermaid.ts'), {
    require: (name) =>
      name === 'mermaid'
        ? {
            default: {
              initialize: (config) => {
                assert.equal(config.startOnLoad, false)
                initialized = true
              },
            },
          }
        : {},
  })
  assert.equal(initialized, true)
  assert.equal(typeof api.setupMermaid, 'function')
})
