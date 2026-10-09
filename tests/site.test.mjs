import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
const root = process.env.BLOG_ROOT || process.cwd()
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8')
const html = (p) => read(`dist/${p ? `${p}/` : ''}index.html`)
const postLinks = (s) =>
  [...s.matchAll(/href="(\/posts\/[^"#?]+)"/g)]
    .map((m) => m[1])
    .filter((href) => !/^\/posts\/\d+$/.test(href))

test('search and theme have unique IDs and exclusive shortcuts', () => {
  const ids = [...html('').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])
  assert.equal(new Set(ids).size, ids.length, 'duplicate page IDs')
  assert.doesNotMatch(read('src/components/SelectTheme.astro'), /e\.key === 'k'/)
})
test('search controls reference a real dialog and back-to-top is labelled', () => {
  const s = html('')
  const control = s.match(/aria-controls="([^"]+)"/)[1]
  assert.ok(s.includes(`id="${control}"`))
  assert.match(read('src/components/Search.astro'), /aria-label="Close search"/)
  assert.match(read('src/pages/posts/[slug].astro'), /aria-label="Back to top"/)
})
test('post listing preserves homepage newest-first order', () => {
  assert.deepEqual(
    postLinks(html('posts')),
    postLinks(html('')).slice(0, postLinks(html('posts')).length),
  )
})
test('archive dates descend within each year', () => {
  for (const year of html('archives').split('data-year').slice(1)) {
    const dates = [...year.matchAll(/<time[^>]*>(\d\d-\d\d)<\/time>/g)].map((m) => m[1])
    assert.deepEqual(dates, [...dates].sort().reverse())
  }
})
test('series latest uses the newest published date', () => {
  const s = html('series')
  assert.match(s, /latest 2025-10-28/)
  assert.doesNotMatch(s, /latest 2025-02-24/)
})
test('post list social image exists and is not an article', () => {
  const s = html('posts')
  assert.match(s, /property="og:type" content="website"/)
  const url = s.match(/property="og:image" content="([^"]+)"/)[1]
  assert.ok(fs.existsSync(path.join(root, 'dist', new URL(url).pathname)))
})
test('hgame image is a processed image, not a broken relative link', () => {
  assert.doesNotMatch(
    html('posts/hgame-2024'),
    /href="hgame-2024\/image-20250209203754718\.png"/,
  )
  assert.match(read('src/content/posts/zh/hgame-2024.md'), /!\[image-20250209203754718\]/)
})
test('friends title is not duplicated and avatar fallback exists', () => {
  assert.match(html('friends'), /<title>Friends - s3loy(?:'|&#39;)s blog<\/title>/)
  assert.match(html('friends'), /friend-avatar-fallback/)
})
test('viewer source keeps the SVG viewBox and explicit setup hook', () => {
  assert.doesNotMatch(read('src/components/MermaidZoom.astro'), /svgPanZoom|setTimeout/)
  assert.match(read('src/scripts/mermaid.ts'), /setupMediaViewer\(\)/)
  assert.match(read('src/scripts/media-viewer.ts'), /viewBox/)
})
test('post layout does not force full-width content beside its TOC', () => {
  assert.doesNotMatch(read('src/pages/posts/[slug].astro'), /xl:min-w-full/)
  assert.match(read('src/styles/global.css'), /minmax\(0, 1fr\)/)
})

test('archive source declares history and focus-order hooks', () => {
  const source = read('src/pages/archives.astro')
  assert.match(source, /history\.pushState/)
  assert.match(source, /addEventListener\('popstate'/)
  assert.match(source, /toggleAttribute\('inert', !visible\)/)
})
test('search assets and results retain the configured deployment base', () => {
  const source = read('src/components/Search.astro')
  assert.match(source, /baseUrl: import.meta.env.BASE_URL/)
  assert.match(source, /bundlePath: import.meta.env.BASE_URL/)
})
