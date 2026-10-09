import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
const root = process.env.BLOG_ROOT || process.cwd()
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8')
const css = read('src/styles/global.css')
test('search uses site-owned styles instead of the default white Pagefind theme', () => {
  assert.doesNotMatch(read('src/components/Search.astro'), /@pagefind\/default-ui\/css/)
  assert.doesNotMatch(css, /--pagefind-ui-/)
  for (const selector of [
    '#search-dialog',
    '#search .pagefind-ui__search-input',
    '#search .pagefind-ui__search-clear',
    '#search .pagefind-ui__button',
  ]) {
    const declaration = css.slice(css.indexOf(selector + ' {')).split('}')[0]
    assert.match(declaration, /background: var\(--theme-background\)/)
    assert.match(declaration, /color: var\(--(?:theme-foreground|muted)\)/)
    assert.match(declaration, /border-radius: 0/)
  }
})
test('search preserves Pagefind visibility and narrow-screen result behavior', () => {
  assert.match(css, /\.pagefind-ui__hidden\s*\{\s*display: none;/)
  assert.match(css, /\.pagefind-ui__suppressed\s*\{\s*visibility: hidden;/)
  assert.match(css, /\.pagefind-ui__result-excerpt\s*\{\s*min-width: 0;/)
  assert.match(css, /#search \.pagefind-ui__loading\s*\{\s*color: transparent;/)
  assert.match(css, /#search :focus-visible\s*\{\s*outline: 2px/)
  assert.match(read('src/components/Search.astro'), /showSubResults: true/)
})
