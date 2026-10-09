import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'parse5'

const root = process.env.BLOG_ROOT || process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const pairs = [
  ['Network-Layer.md', 'Network-Layer-en.md', 'network-layer'],
  ['WoC 2025.md', 'WoC-2025-en.md', 'woc-2025'],
]
const split = (source) => source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/).slice(1)
const field = (metadata, key) => metadata.match(new RegExp(`^${key}: (.+)$`, 'm'))?.[1]
const headings = (body) => [...body.matchAll(/^(#{2,6}) /gm)].map((match) => match[1])
const images = (body) =>
  [...body.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1])
const links = (body) =>
  [...body.matchAll(/(?<!!)\[[^\]]*\]\((https?:[^)]+)\)/g)].map((match) => match[1])
const code = (body) =>
  [...body.matchAll(/```(bash|sql|go|shell)\n([\s\S]*?)\n```/g)].map((match) =>
    match[2].replace('# 把port=11451换成port=5432', '# Change port=11451 to port=5432'),
  )
const nodes = (node) => [node, ...(node.childNodes || []).flatMap(nodes)]
const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value

for (const [original, translated, key] of pairs) {
  test(`${key}: English edition preserves source structure, metadata, code and assets`, () => {
    const [zhMeta, zh] = split(read(`src/content/posts/zh/${original}`))
    const [enMeta, en] = split(
      read(`src/content/posts/en/${translated.replace('-en.md', '.md')}`),
    )
    assert.equal(field(zhMeta, 'lang'), 'zh')
    assert.equal(field(enMeta, 'lang'), 'en')
    assert.equal(field(zhMeta, 'translationKey'), key)
    assert.equal(field(enMeta, 'translationKey'), key)
    for (const name of ['title', 'published', 'series']) {
      assert.equal(field(enMeta, name), field(zhMeta, name))
    }
    assert.deepEqual(headings(en), headings(zh))
    assert.deepEqual(images(en), images(zh))
    assert.deepEqual(links(en), links(zh))
    assert.deepEqual(code(en), code(zh))
    assert.doesNotMatch(en, /\p{Script=Han}/u)
    for (const image of images(en)) {
      assert.ok(fs.existsSync(path.join(root, 'src/content/posts/en', image)))
    }
  })

  for (const [slug, language, alternate] of [
    [key, 'zh', `${key}-en`],
    [`${key}-en`, 'en', key],
  ]) {
    test(`${slug}: built page exposes the matching edition and retains English UI`, () => {
      const doc = nodes(parse(read(`dist/posts/${slug}/index.html`)))
      assert.equal(
        attr(
          doc.find((node) => node.tagName === 'html'),
          'lang',
        ),
        'en',
      )
      const content = doc.find((node) => attr(node, 'class') === 'article-content prose')
      assert.equal(attr(content, 'lang'), language)
      const navigation = doc.find(
        (node) => attr(node, 'aria-label') === 'Article language',
      )
      assert.ok(navigation)
      const current = nodes(navigation).find(
        (node) => attr(node, 'aria-current') === 'page',
      )
      assert.equal(attr(current, 'lang'), language)
      const link = nodes(navigation).find((node) => node.tagName === 'a')
      assert.equal(attr(link, 'href'), `/posts/${alternate}`)
      assert.equal(attr(link, 'hreflang'), language === 'en' ? 'zh' : 'en')
      const alternates = doc.filter(
        (node) => node.tagName === 'link' && attr(node, 'hreflang'),
      )
      assert.equal(alternates.length, 2)
      assert.match(read(`dist/posts/${slug}/index.html`), /Table of Contents/)
    })
  }
}
