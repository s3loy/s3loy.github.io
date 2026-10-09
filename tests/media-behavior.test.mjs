import test from 'node:test'
import assert from 'node:assert/strict'
import { parseFragment } from 'parse5'
import { read, execute, Element } from './helpers/runtime.mjs'
function setup() {
  let focus, dialog
  const images = [],
    diagrams = []
  class Node extends Element {
    constructor(tag = 'div', attrs = {}) {
      super()
      this.tagName = tag.toUpperCase()
      this.attrs = attrs
      this.children = []
      this.clientWidth = 640
      this.clientHeight = 480
      this.isConnected = true
      const classes = new Set((attrs.class || '').split(' '))
      this.classList = {
        add: (value) => classes.add(value),
        remove: (value) => classes.delete(value),
        contains: (value) => classes.has(value),
      }
      for (const [key, value] of Object.entries(attrs))
        if (key.startsWith('data-'))
          this.dataset[key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] =
            value
    }
    get id() {
      return this.attrs.id || ''
    }
    set id(value) {
      this.attrs.id = value
    }
    get attributes() {
      return Object.entries(this.attrs).map(([name, value]) => ({ name, value }))
    }
    all() {
      return this.children.flatMap((node) => [node, ...node.all()])
    }
    matches(selector) {
      if (selector === '*') return true
      if (selector.startsWith('.'))
        return (this.attrs.class || '').split(' ').includes(selector.slice(1))
      const attribute = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/)
      if (attribute)
        return attribute[2] === undefined
          ? attribute[1] in this.attrs
          : this.attrs[attribute[1]] === attribute[2]
      return this.tagName.toLowerCase() === selector
    }
    querySelectorAll(selector) {
      return this.all().filter((node) => node.matches(selector))
    }
    querySelector(selector) {
      return this.querySelectorAll(selector)[0] || null
    }
    closest(selector) {
      return this.matches(selector) ? this : this.parent?.closest(selector) || null
    }
    append(node) {
      node.parent = this
      this.children.push(node)
    }
    replaceChildren(...nodes) {
      this.children = []
      nodes.forEach((node) => this.append(node))
    }
    set innerHTML(html) {
      const convert = (raw) => {
        const node = new Node(
          raw.tagName,
          Object.fromEntries((raw.attrs || []).map((a) => [a.name, a.value])),
        )
        ;(raw.childNodes || [])
          .filter((n) => n.tagName)
          .forEach((n) => node.append(convert(n)))
        return node
      }
      this.replaceChildren(
        ...parseFragment(html)
          .childNodes.filter((n) => n.tagName)
          .map(convert),
      )
    }
    focus() {
      focus = this
    }
    showModal() {
      this.open = true
    }
    close() {
      this.open = false
      this.dispatch('close')
    }
    getBoundingClientRect() {
      return { left: 0, top: 0, width: this.clientWidth, height: this.clientHeight }
    }
    setPointerCapture() {}
    cloneNode() {
      const clone = new this.constructor(this.tagName, { ...this.attrs })
      this.children.forEach((child) => clone.append(child.cloneNode()))
      return clone
    }
  }
  class Image extends Node {
    constructor(tag = 'img', attrs = {}) {
      super(tag, attrs)
      this.complete = true
      this.naturalWidth = 1000
      this.naturalHeight = 800
      this.currentSrc = '/image.png'
    }
    get alt() {
      return this.attrs.alt || ''
    }
  }
  class SVG extends Node {
    constructor(tag = 'svg', attrs = { id: 'diagram' }) {
      super(tag, attrs)
      this.viewBox = { baseVal: { width: 1000, height: 800 } }
    }
  }
  const body = new Node('body')
  const geometry = execute(read('src/scripts/media-geometry.ts'))
  const ids = execute(read('src/scripts/svg-ids.ts'))
  const api = execute(read('src/scripts/media-viewer.ts'), {
    require: (name) => (name === './media-geometry' ? geometry : ids),
    HTMLImageElement: Image,
    SVGSVGElement: SVG,
    document: {
      body,
      get activeElement() {
        return focus
      },
      createElement: (tag) => {
        const node = new Node(tag)
        if (tag === 'dialog') dialog = node
        return node
      },
      querySelectorAll: () => [...images, ...diagrams],
    },
    ResizeObserver: class {
      observe() {}
    },
  })
  return {
    api,
    body,
    images,
    diagrams,
    Image,
    SVG,
    Node,
    dialog: () => dialog,
    focus: () => focus,
  }
}
test('viewer setup preserves image descriptions and binds each element once', async () => {
  const app = setup()
  app.images.push(
    new app.Image('img', { alt: 'IP数据' }),
    new app.Image('img', { alt: '目的不可达报文' }),
  )
  app.api.setupMediaViewer()
  app.api.setupMediaViewer()
  assert.equal(app.images[0].getAttribute('aria-label'), 'Open image: IP数据')
  assert.equal(app.images[1].getAttribute('aria-label'), 'Open image: 目的不可达报文')
  assert.equal(app.images[0].events.click.length, 1)
  assert.equal(app.images[0].tabIndex, 0)
  const source = app.images[0]
  source.focus()
  await source.dispatch('keydown', { key: 'Enter' })
  assert.equal(app.dialog().open, true)
  assert.equal(app.dialog().querySelector('[data-media-title]').textContent, 'IP数据')
  const clone = app.dialog().querySelector('.media-content').children[0]
  assert.equal(clone.getAttribute('role'), null)
  assert.equal(clone.getAttribute('aria-label'), null)
  assert.equal(clone.alt, 'IP数据')
  await app.dialog().querySelector('[data-action="close"]').dispatch('click')
  assert.equal(app.dialog().open, false)
  assert.equal(app.focus(), source)
  assert.equal(app.body.style.overflow, undefined)
})
test('viewer zoom, pan and reset change actual transform; closed viewer clears its clone', async () => {
  const app = setup(),
    image = new app.Image()
  app.images.push(image)
  app.api.setupMediaViewer()
  image.focus()
  await image.dispatch('click')
  const dialog = app.dialog(),
    viewport = dialog.querySelector('.media-viewport'),
    content = dialog.querySelector('.media-content')
  const initial = content.style.transform
  await dialog.querySelector('[data-action="in"]').dispatch('click')
  assert.notEqual(content.style.transform, initial)
  await viewport.dispatch('keydown', { key: 'ArrowRight' })
  assert.match(content.style.transform, /translate\(40px, 0px\)/)
  await viewport.dispatch('keydown', { key: '0' })
  assert.equal(content.style.transform, initial)
  await viewport.dispatch('wheel', { deltaY: -100, clientX: 320, clientY: 240 })
  assert.notEqual(content.style.transform, initial)
  await dialog.querySelector('[data-action="fit"]').dispatch('click')
  assert.equal(content.style.transform, initial)
  await viewport.dispatch('pointerdown', {
    pointerType: 'mouse',
    button: 0,
    pointerId: 1,
    clientX: 20,
    clientY: 20,
  })
  await viewport.dispatch('pointermove', { pointerId: 1, clientX: 30, clientY: 40 })
  assert.match(content.style.transform, /translate\(10px, 20px\)/)
  await viewport.dispatch('pointerup', { pointerId: 1 })
  assert.equal(viewport.classList.contains('is-dragging'), false)
  dialog.close()
  assert.equal(content.children.length, 0)
  assert.equal(app.focus(), image)
})
test('rendered diagrams bind after rendering and replacing an SVG retires the stale clone', async () => {
  const app = setup(),
    pre = new app.Node('pre')
  app.diagrams.push(pre)
  app.api.setupMediaViewer()
  assert.equal(pre.dataset.mediaBound, undefined)
  const svg = new app.SVG()
  pre.append(svg)
  app.api.setupMediaViewer()
  assert.equal(pre.dataset.mediaBound, 'true')
  pre.focus()
  await pre.dispatch('click')
  assert.equal(app.dialog().open, true)
  assert.equal(svg.id, 'diagram')
  assert.equal(
    app.dialog().querySelector('.media-content').children[0].id,
    'viewer-diagram',
  )
  app.api.setupMediaViewer()
  assert.equal(app.dialog().open, true)
  pre.replaceChildren(new app.SVG())
  app.api.setupMediaViewer()
  assert.equal(app.dialog().open, false)
  assert.equal(app.focus(), pre)
})
