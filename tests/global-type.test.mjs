import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
const root = process.env.BLOG_ROOT || process.cwd()
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8')
test('all routes use one type contract without legacy style overrides', () => {
  const layout = read('src/layouts/Layout.astro')
  assert.match(layout, /import '~\/styles\/global.css'/)
  assert.doesNotMatch(layout, /reading.css|typography.css/)
  const css = read('src/styles/global.css')
  for (const [name, value] of Object.entries({
    title: '1.625rem',
    heading: '1.3125rem',
    subheading: '1.0625rem',
    body: '0.875rem',
    small: '0.75rem',
    code: '0.8125rem',
  }))
    assert.ok(css.includes(`--type-${name}: ${value};`))
  assert.doesNotMatch(css, /@apply|tailwind|\bzoom:/)
  assert.match(css, /h1\s*\{\s*font-size: var\(--type-title\)/)
  assert.match(css, /h2\s*\{\s*font-size: var\(--type-heading\)/)
  assert.match(css, /h3\s*\{\s*font-size: var\(--type-subheading\)/)
})
test('indexes and metadata have distinct roles from prose headings', () => {
  const css = read('src/styles/global.css')
  for (const hook of [
    '.post-preview-title',
    '.archive-link',
    '.series-link',
    '.post-meta',
    '.archive-date',
    '.series-meta',
    '.home-intro.prose',
    '#theme-toggle',
  ])
    assert.ok(css.includes(hook), hook)
  assert.match(css, /--ec-codeFontSize: var\(--type-code\)/)
  assert.match(css, /#search \.pagefind-ui__search-input/)
  assert.match(css, /#search \.pagefind-ui__result-title/)
  assert.doesNotMatch(css, /--pagefind-ui-scale:/)
})
test('friends keep square avatars without card borders or backgrounds', () => {
  const css = read('src/styles/global.css')
  const source = read('src/components/FriendCard.astro')
  assert.match(source, /src=\{friend.avatar\}/)
  assert.match(source, /friend.description/)
  assert.match(
    css,
    /\.friend\s*\{[^}]*border: 0;[^}]*border-radius: 0;[^}]*background: none;/,
  )
  assert.match(css, /\.friend-avatar\s*\{[^}]*border-radius: 0;/)
  assert.match(css, /\.friends\s*\{[^}]*repeat\(2, minmax\(0, 1fr\)\)/)
})
test('friends route applies the responsive grid contract', () => {
  assert.match(read('src/pages/friends.astro'), /<section class="friends"/)
  assert.match(read('dist/friends/index.html'), /<section class="friends"/)
  assert.equal(
    (read('dist/friends/index.html').match(/class="friend-avatar"/g) || []).length,
    JSON.parse(read('src/data/links.json')).length,
  )
})
