import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
const root = process.env.BLOG_ROOT || process.cwd()
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8')

test('published and updated remain sibling dates on a single flex line', () => {
  const source = read('src/components/PostPreview.astro')
  const dates = source.match(/<div class="post-preview-dates">([\s\S]*?)<\/div>/)[1]
  assert.equal([...dates.matchAll(/<time datetime=/g)].length, 2)
  assert.doesNotMatch(dates, /<span|<br/)
  const css = read('src/styles/global.css')
  const rules = [...css.matchAll(/\.post-preview-dates\s*\{([^}]+)\}/g)].map((m) => m[1])
  assert.match(rules[0], /display: flex;/)
  assert.match(rules[0], /flex-wrap: nowrap;/)
  assert.match(rules[0], /white-space: nowrap;/)
  assert.ok(rules.every((rule) => !/flex-wrap: wrap;/.test(rule)))
})

test('the shared date pair sits below the title at every breakpoint', () => {
  const css = read('src/styles/global.css')
  const rows = [...css.matchAll(/\.post-preview-row\s*\{([^}]+)\}/g)].map((m) => m[1])
  assert.equal(rows.length, 1)
  assert.match(rows[0], /grid-template-columns: minmax\(0, 1fr\);/)
  const dates = css.match(/\.post-preview-dates\s*\{([^}]+)\}/)[1]
  assert.match(dates, /text-align: left;/)
})
