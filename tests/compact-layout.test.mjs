import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
const root = process.env.BLOG_ROOT || process.cwd()
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8')
test('profile uses a small intrinsic image', () => {
  const banner = read('src/components/HomeBanner.astro')
  assert.match(banner, /width=\{40\}/)
  assert.match(banner, /height=\{40\}/)
  assert.match(banner, /class="home-profile"/)
  assert.doesNotMatch(banner, /GitHubActivityCalendar/)
})
test('compact indexes retain both publication dates and semantic headings', () => {
  assert.match(read('src/components/BlockHeader.astro'), /<h2 class="section-heading"/)
  const preview = read('src/components/PostPreview.astro')
  assert.match(preview, /<h2 class="post-preview-title"/)
  assert.match(preview, /published/)
  assert.match(preview, /updated/)
  assert.match(
    read('src/styles/global.css'),
    /\.post-preview-title\s*\{[^}]*overflow-wrap: anywhere/s,
  )
})
test('compact layout does not scale the page or clamp diagrams', () => {
  const css = read('src/styles/global.css') + read('src/styles/media.css')
  assert.match(css, /\.home-intro\.prose h1/)
  assert.match(css, /\.prose h2/)
  assert.match(
    css,
    /\.prose pre\.mermaid svg\s*\{[^}]*height: auto;[^}]*max-height: none;/s,
  )
  assert.doesNotMatch(css, /\bzoom:\s*[.\d]/)
})
