import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'parse5'
import { slug } from 'github-slugger'
import { execFileSync } from 'node:child_process'
import { execute, read, root } from './helpers/runtime.mjs'

const { getArticleList } = execute(read('src/article-languages.ts'))
const post = (id, lang, translationKey) => ({ id, data: { lang, translationKey } })
const ids = (posts) => Array.from(posts, (post) => post.id)
const nodes = (node) => [node, ...(node.childNodes || []).flatMap(nodes)]
const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value
const text = (node) =>
  nodes(node)
    .filter((item) => item.nodeName === '#text')
    .map((item) => item.value)
    .join('')
const doc = (route) => nodes(parse(read(`dist/${route ? `${route}/` : ''}index.html`)))
const previews = (route) =>
  doc(route).filter((node) => attr(node, 'class') === 'post-preview')
const entries = ['zh', 'en']
  .flatMap((lang) =>
    fs
      .readdirSync(path.join(root, 'src/content/posts', lang), { recursive: true })
      .filter((name) => /\.mdx?$/.test(name))
      .map((name) => {
        const source = read(`src/content/posts/${lang}/${name}`)
        const meta = source.split('---')[1]
        return {
          id: slug(name.replace(/\.mdx?$/, '')) + (lang === 'en' ? '-en' : ''),
          data: {
            lang,
            translationKey: meta.match(/^translationKey: (.+)$/m)?.[1],
            series: meta.match(/^series: ["']?([^"'\n]+)["']?$/m)?.[1],
            draft: /^draft: true$/m.test(meta),
          },
        }
      }),
  )
  .filter((entry) => !entry.data.draft)
const count = getArticleList(entries, 'zh').length

test('article selection counts a translation group once in either language', () => {
  const zh = post('example', 'zh', 'example')
  const en = post('example-en', 'en', 'example')
  const englishOnly = post('new-en', 'en', 'new')
  const unpaired = post('original', 'zh')
  const input = [en, englishOnly, zh, unpaired]
  assert.deepEqual(ids(getArticleList(input, 'zh')), ['example', 'new-en', 'original'])
  assert.deepEqual(ids(getArticleList(input, 'en')), ['example-en', 'new-en', 'original'])
  assert.deepEqual(ids(input), ['example-en', 'new-en', 'example', 'original'])
})

test('published Markdown lives in two language directories without duplicate flat files', () => {
  assert.equal(
    fs
      .readdirSync(path.join(root, 'src/content/posts'))
      .filter((name) => /\.mdx?$/.test(name)).length,
    0,
  )
  for (const lang of ['zh', 'en']) {
    const files = fs
      .readdirSync(path.join(root, 'src/content/posts', lang))
      .filter((name) => name.endsWith('.md'))
    for (const file of files) {
      assert.match(
        read(`src/content/posts/${lang}/${file}`),
        new RegExp(`^lang: ${lang}$`, 'm'),
      )
      assert.ok(!file.endsWith('-en.md'))
    }
  }
})

test('home, archive, post index and RSS count logical articles rather than translations', () => {
  assert.equal(previews('').length, count)
  assert.equal(previews('posts').length, Math.min(15, count))
  assert.equal(
    doc('archives').filter((node) => attr(node, 'data-post') !== undefined).length,
    count,
  )
  assert.equal(
    text(doc('archives').find((node) => attr(node, 'id') === 'archives-total-count')),
    String(count),
  )
  assert.equal((read('dist/rss.xml').match(/<item>/g) || []).length, count)
})

test('Computer Network series contains two entries, not four language editions', () => {
  const seriesCount = getArticleList(entries, 'zh').filter(
    (entry) => entry.data.series === 'Computer Network',
  ).length
  assert.equal(previews('series/computer-network').length, seriesCount)
  const item = doc('series').find(
    (node) =>
      attr(node, 'class') === 'series-index-item' &&
      text(node).includes('Computer Network'),
  )
  assert.ok(text(item).includes(`${seriesCount} posts`))
  for (const suffix of ['', '-en']) {
    const page = doc(`posts/computer-network${suffix}`)
    const meta = page.find((node) => attr(node, 'class') === 'post-meta')
    const languageCount = entries.filter(
      (entry) =>
        entry.data.lang === (suffix ? 'en' : 'zh') &&
        entry.data.series === 'Computer Network',
    ).length
    assert.ok(text(meta).includes(`/ ${languageCount}`))
    assert.equal(previews(`posts/computer-network${suffix}`).length, languageCount)
    for (const preview of previews(`posts/computer-network${suffix}`)) {
      const href = attr(
        nodes(preview).find((node) => node.tagName === 'a'),
        'href',
      )
      assert.equal(href.endsWith('-en'), suffix === '-en')
    }
  }
})

test('existing articles retain dates from before migration and English routes retain social cards', () => {
  const historicalDate = execFileSync(
    'git',
    [
      'log',
      '--follow',
      '-1',
      '--format=%cI',
      'b1e36adafe7f9e5da4d17d075013f20c22fd3b19',
      '--',
      'src/content/posts/Computer-Network.md',
    ],
    { cwd: root, encoding: 'utf8' },
  ).trim()
  const subsequentDate = execFileSync(
    'git',
    [
      'log',
      '--follow',
      '-1',
      '--format=%cI',
      '763699daae6f2012055a926e78f78d2fe40e63b5..HEAD',
      '--',
      'src/content/posts/zh/Computer-Network.md',
    ],
    { cwd: root, encoding: 'utf8' },
  ).trim()
  const expected = new Date(subsequentDate || historicalDate).toISOString().slice(0, 10)
  assert.ok(
    read('dist/posts/computer-network/index.html').includes(`updated ${expected}`),
  )
  for (const entry of entries.filter((entry) => entry.data.lang === 'en')) {
    assert.ok(fs.existsSync(path.join(root, `dist/posts/${entry.id}/index.html`)))
    assert.ok(fs.existsSync(path.join(root, `dist/social-cards/${entry.id}.png`)))
  }
})

test('unpaired IDs cannot collide with explicit translation groups', () => {
  const input = [
    post('one', 'zh', 'example'),
    post('one-en', 'en', 'example'),
    post('example', 'zh'),
  ]
  assert.deepEqual(ids(getArticleList(input, 'zh')), ['one', 'example'])
})

test('article series explicitly exclude fallback editions in a different language', () => {
  assert.match(
    read('src/pages/posts/[slug].astro'),
    /getSortedPosts\(postData.lang\)\)\.filter\([\s\S]*?entry.data.lang === postData.lang/,
  )
})
