import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { toString } from 'mdast-util-to-string'
import { read, root, execute, componentScript } from './helpers/runtime.mjs'

test('Mermaid loader imports and initializes the renderer only on pages containing diagrams', async () => {
  for (const hasDiagram of [false, true]) {
    let imports = 0,
      renders = 0
    const api = execute(
      `export async function run() { ${componentScript('src/components/MermaidLoader.astro')} }`,
      {
        document: {
          querySelector: (selector) => {
            assert.equal(selector, 'pre.mermaid')
            return hasDiagram ? {} : null
          },
        },
        require: () => {
          imports++
          return {
            setupMermaid: () => {
              renders++
            },
          }
        },
      },
    )
    await api.run()
    assert.equal(imports, hasDiagram ? 1 : 0)
    assert.equal(renders, hasDiagram ? 1 : 0)
  }
})

test('built Mermaid bootstrap has a small static dependency closure', () => {
  const dir = path.join(root, 'dist/_astro')
  const entry = fs
    .readdirSync(dir)
    .find((name) => name.startsWith('MermaidLoader.') && name.endsWith('.js'))
  assert.ok(entry)
  const seen = new Set()
  function visit(file) {
    if (seen.has(file)) return
    seen.add(file)
    const source = ts.createSourceFile(
      file,
      fs.readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
    )
    for (const node of source.statements) {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const specifier = node.moduleSpecifier.text
        if (specifier.startsWith('.')) visit(path.resolve(path.dirname(file), specifier))
      }
    }
  }
  visit(path.join(dir, entry))
  assert.ok([...seen].reduce((size, file) => size + fs.statSync(file).size, 0) < 20000)
})

test('description generation bounds Chinese excerpts without relying on spaces', () => {
  const { default: description } = execute(read('src/plugins/remark-description.ts'), {
    require: () => ({ toString }),
  })
  const data = { astro: { frontmatter: {} } }
  const paragraph = {
    type: 'root',
    children: [
      { type: 'paragraph', children: [{ type: 'text', value: '中'.repeat(300) }] },
    ],
  }
  description({ maxChars: 200 })(paragraph, { data })
  assert.equal(data.astro.frontmatter.description, '中'.repeat(200) + '…')
  data.astro.frontmatter.description = 'Explicit description'
  description({ maxChars: 200 })(paragraph, { data })
  assert.equal(data.astro.frontmatter.description, 'Explicit description')
})

test('article metadata and RSS consume generated descriptions, not the site fallback', () => {
  const html = read('dist/posts/hot-100/index.html')
  assert.match(html, /name="description" content="梦开始的地方"/)
  assert.match(html, /property="og:description" content="梦开始的地方"/)
  assert.match(read('dist/rss.xml'), /<description>(?:<!\[CDATA\[)?梦开始的地方/)
})

test('direct imports are declared and obsolete configuration contracts are absent', () => {
  const config = JSON.parse(read('package.json'))
  for (const name of [
    'github-slugger',
    'unist-util-visit',
    'mdast-util-find-and-replace',
    'mdast-util-to-markdown',
  ])
    assert.ok(config.dependencies[name])
  assert.equal(config.dependencies['@types/react-dom'], undefined)
  assert.doesNotMatch(read('src/utils.ts'), /export function pick\b|sortCollationsAlpha/)
  assert.doesNotMatch(read('src/types.ts'), /light-dark-auto|external\?:/)
  assert.doesNotMatch(read('src/layouts/Layout.astro'), /preference === 'auto'/)
  assert.match(
    read('.github/workflows/astro.yml'),
    /npm run check && npm run format:check/,
  )
  assert.match(read('.github/workflows/astro.yml'), /run: npm test/)
})

test('description truncation preserves complete Unicode characters', () => {
  const { default: description } = execute(read('src/plugins/remark-description.ts'), {
    require: () => ({ toString }),
  })
  const data = { astro: { frontmatter: {} } }
  description({ maxChars: 200 })(
    {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: '中'.repeat(199) + '😀' + '文'.repeat(20) }],
        },
      ],
    },
    { data },
  )
  assert.equal(data.astro.frontmatter.description, '中'.repeat(199) + '😀…')
  assert.equal(data.astro.frontmatter.description.isWellFormed(), true)
})
