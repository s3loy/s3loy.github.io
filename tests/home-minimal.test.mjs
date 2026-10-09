import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = process.env.BLOG_ROOT || process.cwd()
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8')

test('homepage omits the contribution wall without removing profile or posts', () => {
  assert.doesNotMatch(read('src/content/home.md'), /^githubCalendar:/m)
  const html = read('dist/index.html')
  assert.doesNotMatch(html, /id="github-activity-calendar"/)
  assert.doesNotMatch(html, /contributions in the last year/)
  assert.match(html, /alt="My avatar"/)
  assert.match(html, /There is s3/)
  assert.match(html, /href="\/posts\/oauth-and-oidc"/)
  assert.match(html, /href="https:\/\/github.com\/s3loy"/)
})
