import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'
import { parse } from 'parse5'

const root = process.env.BLOG_ROOT || process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const context = vm.createContext({ exports: {} })
vm.runInContext(
  ts.transpileModule(read('src/article-languages.ts'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  context,
)
const { getArticleVersions } = context.exports
const post = (id, lang, translationKey, draft = false) => ({
  id,
  data: { lang, translationKey, draft },
})
const ids = (versions) => Array.from(versions, (version) => version.id)
const nodes = (node) => [node, ...(node.childNodes || []).flatMap(nodes)]
const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value

test('article versions require an explicit group, never guessed titles or IDs', () => {
  const zh = post('example', 'zh')
  const en = post('example-en', 'en')
  assert.deepEqual(ids(getArticleVersions(zh, [zh, en])), ['example'])
  assert.deepEqual(ids(getArticleVersions(en, [zh, en])), ['example-en'])
})

test('paired articles keep stable IDs and deterministic language order', () => {
  const zh = post('original-url', 'zh', 'example')
  const en = post('english-url', 'en', 'example')
  const other = post('other', 'zh', 'different')
  const entries = [en, other, zh]
  assert.deepEqual(ids(getArticleVersions(en, entries)), ['original-url', 'english-url'])
  assert.deepEqual(ids(getArticleVersions(zh, entries)), ['original-url', 'english-url'])
  assert.deepEqual(ids(entries), ['english-url', 'other', 'original-url'])
})

test('incomplete groups expose only the available version', () => {
  const en = post('english-only', 'en', 'example')
  assert.deepEqual(ids(getArticleVersions(en, [en])), ['english-only'])
})

test('duplicate group languages fail with an actionable error', () => {
  const zh = post('first', 'zh', 'example')
  assert.throws(
    () => getArticleVersions(zh, [zh, post('second', 'zh', 'example')]),
    /Duplicate article language "zh" for translationKey "example"/,
  )
})

test('language links consume the same published collection as generated routes', () => {
  assert.match(
    read('src/utils.ts'),
    /import\.meta\.env\.PROD \? data\.draft !== true : true/,
  )
  assert.match(
    read('src/pages/posts/[slug].astro'),
    /const posts = await getSortedPosts\('all'\)/,
  )
  assert.match(
    read('src/pages/posts/[slug].astro'),
    /versions: getArticleVersions\(post, posts\)/,
  )
})

test('built article keeps English UI and marks Chinese content', () => {
  const doc = nodes(parse(read('dist/posts/oauth-and-oidc/index.html')))
  assert.equal(
    attr(
      doc.find((node) => node.tagName === 'html'),
      'lang',
    ),
    'en',
  )
  const content = doc.find((node) => attr(node, 'class') === 'article-content prose')
  assert.equal(attr(content, 'lang'), 'zh')
  const nav = doc.find((node) => attr(node, 'aria-label') === 'Article language')
  assert.ok(nav)
  assert.equal(attr(nav, 'data-pagefind-ignore'), '')
  assert.equal(nodes(nav).filter((node) => node.tagName === 'a').length, 1)
  assert.equal(
    attr(
      nodes(nav).find((node) => node.tagName === 'span'),
      'aria-current',
    ),
    'page',
  )
  assert.equal(
    doc.filter((node) => node.tagName === 'link' && attr(node, 'hreflang')).length,
    2,
  )
  assert.match(read('dist/posts/oauth-and-oidc/index.html'), /Table of Contents/)
  assert.match(read('dist/posts/oauth-and-oidc/index.html'), />published /)
  assert.match(read('dist/posts/oauth-and-oidc/index.html'), />updated /)
  assert.doesNotMatch(read('dist/about/index.html'), /aria-label="Article language"/)
})

test('article language control sits between search and theme, never in article metadata', () => {
  for (const slug of [
    'network-layer',
    'network-layer-en',
    'woc-2025',
    'woc-2025-en',
    'oauth-and-oidc',
  ]) {
    const doc = nodes(parse(read(`dist/posts/${slug}/index.html`)))
    const tools = doc.find((node) => attr(node, 'class') === 'site-tools')
    const nav = doc.find((node) => attr(node, 'aria-label') === 'Article language')
    assert.equal(nav.parentNode, tools)
    const children = tools.childNodes.filter((node) => node.tagName)
    const searchIndex = children.findIndex((node) => attr(node, 'id') === 'search')
    assert.ok(searchIndex >= 0)
    assert.ok(searchIndex < children.indexOf(nav))
    assert.equal(attr(children[children.indexOf(nav) + 1], 'id'), 'theme-toggle')
    const metadata = doc.find((node) => attr(node, 'class') === 'post-header')
    assert.ok(!nodes(metadata).includes(nav))
    const labels = nodes(nav).filter((node) => ['zh', 'en'].includes(attr(node, 'lang')))
    const text = (node) =>
      nodes(node)
        .filter((child) => child.nodeName === '#text')
        .map((child) => child.value)
        .join('')
        .trim()
    assert.deepEqual(labels.map(text), ['中', 'En'])
    assert.equal(
      nodes(nav).filter((node) => attr(node, 'aria-hidden') === 'true').length,
      1,
    )
  }
})

test('missing editions retain the disabled state rather than an invented URL', () => {
  const component = read('src/components/ArticleLanguages.astro')
  assert.match(
    component,
    /const href = version \? `\/posts\/\$\{version.id\}` : undefined/,
  )
  assert.match(component, /aria-disabled="true"/)
  assert.match(component, /translation not available/)
})
