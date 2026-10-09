import test from 'node:test'
import assert from 'node:assert/strict'
import { componentScript, execute, Element } from './helpers/runtime.mjs'
function setup(query = '') {
  const location = { href: 'https://example.test/archives' + query, search: query }
  const chips = ['all', 'go', 'web'].map((value) =>
    Object.assign(new Element(), {
      dataset: { value },
      href: 'https://example.test/archives' + (value === 'all' ? '' : '?tag=' + value),
    }),
  )
  const posts = ['go', 'web', 'go,web'].map((tags) =>
    Object.assign(new Element(), { dataset: { tags } }),
  )
  const years = [[posts[0]], posts.slice(1)].map((items) =>
    Object.assign(new Element(), {
      querySelector: () => items.find((post) => !post.hidden),
    }),
  )
  const total = new Element(),
    window = new Element(),
    stack = [location.href]
  let index = 0
  const navigate = (url) => {
    location.href = url
    location.search = new URL(url).search
  }
  const history = {
    pushState: (_, __, url) => {
      stack.splice(++index)
      stack.push(url)
      navigate(url)
    },
  }
  execute(componentScript('src/pages/archives.astro'), {
    location,
    history,
    window,
    URLSearchParams,
    document: {
      querySelectorAll: (selector) =>
        ({ '.filter-chip': chips, '[data-post]': posts, '[data-year]': years })[selector],
      querySelector: () => total,
    },
  })
  return {
    chips,
    posts,
    years,
    total,
    location,
    history: async (delta) => {
      index += delta
      navigate(stack[index])
      await window.dispatch('popstate')
    },
  }
}
test('archive click, back and forward restore actual visible posts and focus order', async () => {
  const app = setup()
  await app.chips[1].dispatch('click', { button: 0 })
  assert.deepEqual(
    app.posts.map((post) => post.hidden),
    [false, true, false],
  )
  assert.equal(app.posts[1].getAttribute('inert'), '')
  assert.equal(app.total.textContent, '2')
  assert.equal(app.chips[1].getAttribute('aria-current'), 'true')
  await app.chips[2].dispatch('click', { button: 0 })
  assert.equal(app.years[0].hidden, true)
  await app.history(-1)
  assert.equal(app.years[0].hidden, false)
  assert.deepEqual(
    app.posts.map((post) => post.hidden),
    [false, true, false],
  )
  await app.history(1)
  assert.deepEqual(
    app.posts.map((post) => post.hidden),
    [true, false, false],
  )
  await app.chips[0].dispatch('click', { button: 0 })
  assert.equal(app.total.textContent, '3')
  assert.ok(
    app.posts.every((post) => !post.hidden && post.getAttribute('inert') === null),
  )
})
test('archive ignores modified clicks and falls back for unknown query tags', async () => {
  const app = setup('?tag=missing')
  assert.equal(app.total.textContent, '3')
  await app.chips[1].dispatch('click', { ctrlKey: true, button: 0 })
  assert.equal(app.location.search, '?tag=missing')
  assert.ok(app.posts.every((post) => !post.hidden))
})
