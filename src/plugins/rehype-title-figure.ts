import type * as hast from 'hast'
import type { RehypePlugin } from '@astrojs/markdown-remark'
import { h } from 'hastscript'

export const rehypeTitleFigure: RehypePlugin = (_options?) => {
  function buildFigure(el: hast.Element) {
    const title = `${el.properties?.title || ''}`
    if (!title) return el
    const figure = h('figure', [h('img', { ...el.properties }), h('figcaption', title)])
    return figure
  }
  function isElement(content: hast.RootContent): content is hast.Element {
    return content.type === 'element'
  }
  function transformTree(node: hast.Root | hast.Element) {
    if (node.children) {
      node.children = node.children.map((child) => {
        if (isElement(child)) {
          if (child.tagName === 'img') {
            return buildFigure(child)
          } else {
            transformTree(child)
          }
        }
        return child
      })
    }
  }
  return function (tree: hast.Root) {
    transformTree(tree)
  }
}

export default rehypeTitleFigure
