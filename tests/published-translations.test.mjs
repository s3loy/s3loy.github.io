import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import MarkdownIt from 'markdown-it'
import { parse } from 'parse5'

const root = process.env.BLOG_ROOT || process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const md = new MarkdownIt()
const split = (source) => source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/).slice(1)
const field = (meta, name) => meta.match(new RegExp(`^${name}: (.+)$`, 'm'))?.[1]
const entries = fs
  .readdirSync(path.join(root, 'src/content/posts'), { recursive: true })
  .filter((name) => /\.mdx?$/.test(name))
  .map((name) => {
    const [meta, body] = split(read(`src/content/posts/${name}`))
    return {
      name,
      meta,
      body,
      lang: field(meta, 'lang'),
      key: field(meta, 'translationKey'),
    }
  })
  .filter((entry) => field(entry.meta, 'draft') !== 'true')
const historicalKeys = [
  'algorithm',
  'computer-network',
  'hot-100',
  'leetcode-review',
  'my-fedora-journey',
  'network-layer',
  'oauth-and-oidc',
  'proxy-server',
  'why-proxy-traffic-gets-detected',
  'woc-2025',
  'hgame-2024',
]
const groups = Map.groupBy(
  entries.filter((entry) => entry.key),
  (entry) => entry.key,
)
const nodes = (node) => [node, ...(node.childNodes || []).flatMap(nodes)]
const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value
const targets = (tokens) =>
  tokens
    .flatMap((token) => token.children || [])
    .flatMap((token) =>
      (token.attrs || [])
        .filter(([name]) => ['href', 'src'].includes(name))
        .map(([, value]) => value),
    )
    .sort()

test('all existing translated articles retain both editions while new articles may be single-language', () => {
  assert.ok(entries.length > 0)
  for (const key of historicalKeys) assert.ok(groups.has(key), key)
  for (const [key, editions] of groups) {
    assert.equal(new Set(editions.map((entry) => entry.lang)).size, editions.length, key)
    if (historicalKeys.includes(key))
      assert.deepEqual(editions.map((entry) => entry.lang).sort(), ['en', 'zh'], key)
  }
})

for (const [key, editions] of groups) {
  if (!historicalKeys.includes(key)) continue
  test(`${key}: complete translation retains headings, code-block languages, links, assets and metadata`, () => {
    const zh = editions.find((entry) => entry.lang === 'zh')
    const en = editions.find((entry) => entry.lang === 'en')
    assert.ok(zh && en)
    for (const name of [
      'published',
      'modified',
      'series',
      'pin',
      'draft',
      'author',
      'toc',
    ]) {
      assert.equal(field(en.meta, name), field(zh.meta, name), name)
    }
    assert.equal(
      en.meta.match(/^tags:\n(?:[ \t]+.*\n?)*/m)?.[0]?.trim(),
      zh.meta.match(/^tags:\n(?:[ \t]+.*\n?)*/m)?.[0]?.trim(),
    )
    const original = md.parse(zh.body, {})
    const translated = md.parse(en.body, {})
    for (const type of ['heading_open', 'fence']) {
      const signature = (tokens) =>
        tokens
          .filter((token) => token.type === type)
          .map((token) => (type === 'fence' ? token.info : token.tag))
      assert.deepEqual(signature(translated), signature(original), type)
    }
    assert.deepEqual(targets(translated), targets(original))
    for (const token of translated
      .flatMap((token) => token.children || [])
      .filter((token) => token.type === 'image')) {
      const source = token.attrGet('src')
      if (!/^https?:/.test(source)) {
        assert.ok(
          fs.existsSync(
            path.resolve(root, 'src/content/posts', path.dirname(en.name), source),
          ),
          source,
        )
      }
    }
    const prose = translated
      .flatMap((token) => token.children || [])
      .filter((token) => token.type === 'text')
      .map((token) => token.content)
      .join('\n')
    assert.doesNotMatch(
      key === 'hgame-2024' ? prose.replace('hgame{可执行恶意文件名称}', '') : prose,
      /\p{Script=Han}/u,
    )
  })

  for (const lang of ['zh', 'en']) {
    const slug = `${key}${lang === 'en' ? '-en' : ''}`
    const alternate = `${key}${lang === 'zh' ? '-en' : ''}`
    test(`${slug}: built header switches to its counterpart with English UI`, () => {
      const doc = nodes(parse(read(`dist/posts/${slug}/index.html`)))
      assert.equal(
        attr(
          doc.find((node) => node.tagName === 'html'),
          'lang',
        ),
        'en',
      )
      assert.equal(
        attr(
          doc.find((node) => attr(node, 'class') === 'article-content prose'),
          'lang',
        ),
        lang,
      )
      const nav = doc.find((node) => attr(node, 'aria-label') === 'Article language')
      assert.ok(nav)
      assert.equal(attr(nav.parentNode, 'class'), 'site-tools')
      const elements = nav.parentNode.childNodes.filter((node) => node.tagName)
      assert.equal(attr(elements[elements.indexOf(nav) + 1], 'id'), 'theme-toggle')
      assert.equal(
        attr(
          nodes(nav).find((node) => attr(node, 'aria-current') === 'page'),
          'lang',
        ),
        lang,
      )
      const links = nodes(nav).filter((node) => node.tagName === 'a')
      assert.equal(links.length, 1)
      assert.equal(attr(links[0], 'href'), `/posts/${alternate}`)
      assert.equal(attr(links[0], 'hreflang'), lang === 'en' ? 'zh' : 'en')
      assert.equal(
        doc.filter((node) => node.tagName === 'link' && attr(node, 'hreflang')).length,
        2,
      )
      assert.ok(fs.existsSync(path.join(root, `dist/posts/${alternate}/index.html`)))
      assert.ok(!nodes(nav).some((node) => attr(node, 'aria-disabled') === 'true'))
    })
  }
}
