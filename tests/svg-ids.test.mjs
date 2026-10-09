import test from 'node:test'
import assert from 'node:assert/strict'
import { createSVGReferenceRewriter, namespaceSVG } from '../src/scripts/svg-ids.ts'
test('SVG fragment rewriting is exact, single-pass and preserves unrelated references', () => {
  const ids = new Map([
    ['a', 'viewer-a'],
    ['a-long', 'viewer-a-long'],
  ])
  assert.equal(
    createSVGReferenceRewriter(ids)('#a #a-long url(#a) #a-longer #abc #a.node'),
    '#viewer-a #viewer-a-long url(#viewer-a) #a-longer #abc #viewer-a.node',
  )
})
test('SVG IDs, CSS markers and accessible IDREFs move into the same namespace', () => {
  const element = (id, values = {}, tagName = 'g') => ({
    id,
    tagName,
    textContent: '#title .node{marker-end:url(#arrowhead)}',
    attributes: Object.entries(values).map(([name, value]) => ({ name, value })),
    setAttribute(name, value) {
      this.attributes.find((a) => a.name === name).value = value
    },
  })
  const title = element('title'),
    marker = element('arrowhead'),
    style = element('', {}, 'style')
  const svg = element(
    'root',
    { 'aria-labelledby': 'title description', style: 'marker-end:url(#arrowhead)' },
    'svg',
  )
  svg.querySelectorAll = () => [title, marker, style]
  namespaceSVG(svg, 'diagram-1-')
  assert.equal(title.id, 'diagram-1-title')
  assert.equal(svg.attributes[0].value, 'diagram-1-title description')
  assert.equal(svg.attributes[1].value, 'marker-end:url(#diagram-1-arrowhead)')
  assert.match(style.textContent, /#diagram-1-title/)
})
