import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
const root = process.env.BLOG_ROOT || process.cwd()
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8')
const article = () => read('src/content/posts/zh/OAuth-and-OIDC.md')
test('editorial style is opt-in for exactly one sample, preserving all 16 diagrams', () => {
  assert.equal([...article().matchAll(/```mermaid\n/g)].length, 16)
  assert.equal([...article().matchAll(/^%% @style editorial$/gm)].length, 1)
  const config = read('src/scripts/mermaid.ts')
  assert.match(config, /getMermaidConfig\(editorial = false\)/)
  assert.match(config, /mermaid\.initialize\(getMermaidConfig\(editorial\)\)/)
  assert.match(config, /actorFontFamily: diagramFont/)
  assert.match(config, /messageFontFamily: diagramFont/)
  assert.match(config, /noteFontFamily: diagramFont/)
})
test('sample retains five exchanges; payloads and risks remain outside the diagram', () => {
  const block = article().match(/```mermaid\n%% @style editorial([\s\S]*?)```/)[1]
  assert.equal([...block.matchAll(/--?>>/g)].length, 5)
  assert.equal([...block.matchAll(/Note over/g)].length, 1)
  assert.doesNotMatch(block, /grant_type|Authorization:/)
  for (const detail of [
    'grant_type=password&username=<username>&password=<password>',
    'Authorization: Bearer <token>',
    'HTTP/1.1 200 OK',
    '客户端内存、日志或第三方 SDK',
    'MFA、Passkeys、SSO 和授权确认页面',
  ])
    assert.ok(article().includes(detail), detail)
})
