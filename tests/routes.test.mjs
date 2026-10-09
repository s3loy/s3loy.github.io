import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'parse5'
const root = path.join(process.env.BLOG_ROOT || process.cwd(), 'dist')
const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(dir, entry.name))
        : [path.join(dir, entry.name)],
    )
const flatten = (node) => [node, ...(node.childNodes || []).flatMap(flatten)]
test('every built HTML page resolves its local links, anchors and images', () => {
  const files = walk(root).filter((file) => file.endsWith('.html'))
  const pages = new Map(
    files.map((file) => [file, flatten(parse(fs.readFileSync(file, 'utf8')))]),
  )
  for (const [file, nodes] of pages) {
    for (const node of nodes) {
      const attrs = Object.fromEntries(
        (node.attrs || []).map((attr) => [attr.name, attr.value]),
      )
      const ref =
        node.tagName === 'a' ? attrs.href : node.tagName === 'img' ? attrs.src : undefined
      if (!ref || /^(?:[a-z]+:|\/\/)/i.test(ref)) continue
      const base =
        'https://local.test/' + path.relative(root, file).replace(/index\.html$/, '')
      const url = new URL(ref, base)
      const target = path.join(root, decodeURIComponent(url.pathname))
      const candidates = [target, target + '.html', path.join(target, 'index.html')]
      const resolved = candidates.find(
        (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
      )
      assert.ok(resolved, `${path.relative(root, file)} -> ${ref}`)
      if (url.hash && pages.has(resolved)) {
        const id = decodeURIComponent(url.hash.slice(1))
        assert.ok(
          pages
            .get(resolved)
            .some((n) => n.attrs?.some((a) => a.name === 'id' && a.value === id)),
          `${path.relative(root, file)} -> missing ${ref}`,
        )
      }
    }
  }
})
