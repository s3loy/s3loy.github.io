export function createSVGReferenceRewriter(ids: Map<string, string>) {
  const alternatives = [...ids.keys()]
    .sort((a, b) => b.length - a.length)
    .map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
  const pattern = new RegExp(`#(${alternatives})(?![\\w:-])`, 'g')
  return (value: string) =>
    ids.size ? value.replace(pattern, (_, id) => `#${ids.get(id)}`) : value
}

export function namespaceSVG(svg: SVGSVGElement, prefix: string) {
  const elements = [svg, ...svg.querySelectorAll<SVGElement>('*')]
  const ids = new Map(
    elements.filter((el) => el.id).map((el) => [el.id, `${prefix}${el.id}`]),
  )
  const rewrite = createSVGReferenceRewriter(ids)
  for (const el of elements) {
    for (const attr of [...el.attributes]) {
      if (attr.name === 'id') continue
      const value = /^(aria-labelledby|aria-describedby)$/.test(attr.name)
        ? attr.value
            .split(/\s+/)
            .map((id) => ids.get(id) ?? id)
            .join(' ')
        : rewrite(attr.value)
      if (value !== attr.value) el.setAttribute(attr.name, value)
    }
    if (el.tagName.toLowerCase() === 'style')
      el.textContent = rewrite(el.textContent || '')
    if (el.id) el.id = ids.get(el.id)!
  }
}
