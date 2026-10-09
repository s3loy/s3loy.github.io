import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
const root = process.env.BLOG_ROOT || process.cwd()
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8')
const blocks = () =>
  [
    ...read('src/content/posts/zh/OAuth-and-OIDC.md').matchAll(
      /```mermaid\n([\s\S]*?)```/g,
    ),
  ].map((m) => m[1])
test('manual Mermaid line breaks retain content-sized notes and bottom participants', () => {
  const config = read('src/scripts/mermaid.ts')
  assert.match(config, /wrap: false/)
  assert.match(config, /mirrorActors: true/)
  assert.match(config, /await document\.fonts\.ready/)
})
test('literal hashes in sequence labels do not silently start comments', () => {
  for (const [i, block] of blocks().entries()) {
    for (const line of block.split('\n').filter((l) => /:\s*\S/.test(l)))
      assert.doesNotMatch(
        line,
        /#(?!\d+;|[a-zA-Z]+;)/,
        `diagram ${i + 1}: unescaped hash truncates the remainder of this label`,
      )
  }
})
test('OAuth diagrams preserve token fragments, DPoP response, mTLS comparison and device response', () => {
  const diagrams = blocks()
  assert.match(diagrams[5], /https:\/\/app.com\/#35;access_token=secret_token/)
  assert.match(diagrams[12], /#35; 包含 cnf:.*"token_type": "DPoP".*"expires_in": 3600/)
  assert.match(diagrams[13], /x5t#35;S256 == TLS 证书指纹？/)
  assert.match(diagrams[14], /#35; 短码，方便输入.*"verification_uri".*"interval": 5/)
})
test('inline long diagrams have no fixed max-height cap', () => {
  const rule = read('src/styles/media.css').match(
    /\.prose pre\.mermaid svg\s*\{([^}]+)\}/,
  )[1]
  assert.match(rule, /height: auto;/)
  assert.match(rule, /max-height: none;/)
})

test('long two-actor notes opt into wrapping only where no manual breaks exist', () => {
  assert.match(blocks()[4], /Note over Client,Attacker:wrap: ⚠️ Attacker sniffs/)
  assert.match(blocks()[4], /Note over Client,Attacker:wrap: Attacker intercepts/)
  assert.match(
    read('src/content/posts/zh/Why-Proxy-Traffic-Gets-Detected.md'),
    /Note over U,G:wrap: 2\) TLS 握手开始/,
  )
})
