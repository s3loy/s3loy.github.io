import { fitScale, zoomAt } from './media-geometry'
import { namespaceSVG } from './svg-ids'

type Source = HTMLElement | SVGSVGElement
let dialog: HTMLDialogElement
let viewport: HTMLElement
let content: HTMLElement
let previousFocus: HTMLElement | null = null
let activeSource: Source | null = null
let nativeWidth = 1
let nativeHeight = 1
let scale = 1
let fit = 1
let x = 0
let y = 0
let downloadSource: SVGSVGElement | null = null
const pointers = new Map<number, { x: number; y: number }>()

function update() {
  content.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
  dialog.querySelector('[data-media-scale]')!.textContent = `${Math.round(scale * 100)}%`
}

function reset() {
  fit = fitScale(nativeWidth, nativeHeight, viewport.clientWidth, viewport.clientHeight)
  scale = fit
  x = y = 0
  update()
}

function zoom(next: number, pointX = 0, pointY = 0) {
  next = Math.min(4, Math.max(fit * 0.5, next))
  const result = zoomAt(scale, next, x, y, pointX, pointY)
  scale = result.scale
  x = result.x
  y = result.y
  update()
}

function saveSVG() {
  if (!downloadSource) return
  const svg = downloadSource.cloneNode(true) as SVGSVGElement
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const url = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(svg)], {
      type: 'image/svg+xml;charset=utf-8',
    }),
  )
  const link = document.createElement('a')
  link.href = url
  link.download = 'mermaid-diagram.svg'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function ensureDialog() {
  if (dialog) return
  dialog = document.createElement('dialog')
  dialog.className = 'media-modal'
  dialog.setAttribute('aria-label', 'Media viewer')
  dialog.innerHTML = `<div class="media-viewer">
    <div class="media-topbar"><h2 class="media-title" data-media-title></h2>
      <div class="media-controls" role="toolbar" aria-label="Media controls">
        <button type="button" data-action="out" aria-label="Zoom out">−</button>
        <button type="button" data-action="fit" aria-label="Fit to screen">Fit</button>
        <button type="button" data-action="actual" aria-label="Actual size">1:1</button>
        <button type="button" data-action="in" aria-label="Zoom in">+</button>
        <button type="button" data-action="download" aria-label="Download SVG">SVG ↓</button>
        <button type="button" data-action="close" aria-label="Close viewer">Close ×</button>
      </div>
    </div>
    <div class="media-viewport" tabindex="0" aria-label="Drag to pan; use plus, minus or zero to zoom"><div class="media-canvas"><div class="media-content"></div></div></div>
    <div class="media-footer"><span data-media-scale></span> · Drag to pan · Scroll to zoom · Esc to close</div>
  </div>`
  document.body.append(dialog)
  viewport = dialog.querySelector('.media-viewport')!
  content = dialog.querySelector('.media-content')!
  dialog.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      switch (button.dataset.action) {
        case 'in':
          zoom(scale * 1.25)
          break
        case 'out':
          zoom(scale / 1.25)
          break
        case 'fit':
          reset()
          break
        case 'actual':
          zoom(1)
          break
        case 'download':
          saveSVG()
          break
        case 'close':
          dialog.close()
          break
      }
    })
  })
  viewport.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault()
      const rect = viewport.getBoundingClientRect()
      zoom(
        scale * Math.exp(-Math.max(-100, Math.min(100, event.deltaY)) * 0.004),
        event.clientX - rect.left - rect.width / 2,
        event.clientY - rect.top - rect.height / 2,
      )
    },
    { passive: false },
  )
  viewport.addEventListener('dblclick', (event) => {
    event.preventDefault()
    if (Math.abs(scale - fit) < 0.01) zoom(Math.max(1, fit * 2))
    else reset()
  })
  viewport.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    viewport.focus()
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    viewport.setPointerCapture(event.pointerId)
    viewport.classList.add('is-dragging')
    event.preventDefault()
  })
  viewport.addEventListener('pointermove', (event) => {
    const old = pointers.get(event.pointerId)
    if (!old) return
    const before = [...pointers.values()]
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const after = [...pointers.values()]
    if (after.length === 2) {
      const distance = (p: typeof after) => Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y)
      const oldDistance = distance(before)
      const rect = viewport.getBoundingClientRect()
      const oldCenter = {
        x: (before[0].x + before[1].x) / 2,
        y: (before[0].y + before[1].y) / 2,
      }
      if (oldDistance > 0)
        zoom(
          (scale * distance(after)) / oldDistance,
          oldCenter.x - rect.left - rect.width / 2,
          oldCenter.y - rect.top - rect.height / 2,
        )
      x += (after[0].x + after[1].x) / 2 - oldCenter.x
      y += (after[0].y + after[1].y) / 2 - oldCenter.y
    } else if (after.length === 1) {
      x += event.clientX - old.x
      y += event.clientY - old.y
    }
    update()
  })
  const release = (event: PointerEvent) => {
    pointers.delete(event.pointerId)
    if (!pointers.size) viewport.classList.remove('is-dragging')
  }
  viewport.addEventListener('pointerup', release)
  viewport.addEventListener('pointercancel', release)
  viewport.addEventListener('lostpointercapture', release)
  viewport.addEventListener('keydown', (event) => {
    if (
      ['+', '=', '-', '0', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
        event.key,
      )
    )
      event.preventDefault()
    if (event.key === '+' || event.key === '=') zoom(scale * 1.25)
    if (event.key === '-') zoom(scale / 1.25)
    if (event.key === '0') reset()
    if (event.key === 'ArrowLeft') x -= 40
    if (event.key === 'ArrowRight') x += 40
    if (event.key === 'ArrowUp') y -= 40
    if (event.key === 'ArrowDown') y += 40
    update()
  })
  dialog.addEventListener('close', () => {
    pointers.clear()
    viewport.classList.remove('is-dragging')
    content.replaceChildren()
    activeSource = null
    previousFocus?.focus({ preventScroll: true })
  })
  new ResizeObserver(() => {
    if (dialog.open) reset()
  }).observe(viewport)
}

function uniqueSVG(source: SVGSVGElement) {
  const clone = source.cloneNode(true) as SVGSVGElement
  namespaceSVG(clone, 'viewer-')
  return clone
}

export function openMediaViewer(source: Source) {
  const svg =
    source instanceof SVGSVGElement ? source : source.querySelector<SVGSVGElement>('svg')
  if (!svg && !(source instanceof HTMLImageElement)) return
  if (source instanceof HTMLImageElement && (!source.complete || !source.naturalWidth))
    return
  ensureDialog()
  previousFocus = document.activeElement as HTMLElement
  activeSource = source
  downloadSource = svg || null
  const clone = svg ? uniqueSVG(svg) : (source.cloneNode(true) as HTMLImageElement)
  if (svg) {
    const box = svg.viewBox.baseVal
    nativeWidth = box.width || svg.getBoundingClientRect().width
    nativeHeight = box.height || svg.getBoundingClientRect().height
    clone.removeAttribute('style')
    clone.setAttribute('width', String(nativeWidth))
    clone.setAttribute('height', String(nativeHeight))
  } else {
    nativeWidth = (source as HTMLImageElement).naturalWidth
    nativeHeight = (source as HTMLImageElement).naturalHeight
    clone.removeAttribute('loading')
    clone.removeAttribute('srcset')
    clone.setAttribute('src', (source as HTMLImageElement).currentSrc)
    clone.removeAttribute('aria-label')
    clone.removeAttribute('role')
    clone.removeAttribute('tabindex')
    clone.removeAttribute('data-media-bound')
  }
  content.style.width = `${nativeWidth}px`
  content.style.height = `${nativeHeight}px`
  content.replaceChildren(clone)
  dialog.querySelector('[data-media-title]')!.textContent = svg
    ? source.closest('figure')?.querySelector('.diagram-label')?.textContent || 'Diagram'
    : (source as HTMLImageElement).alt || 'Image'
  dialog.querySelector<HTMLButtonElement>('[data-action="download"]')!.hidden = !svg
  dialog.showModal()
  reset()
  dialog.querySelector<HTMLButtonElement>('[data-action="close"]')!.focus()
}

export function setupMediaViewer() {
  document
    .querySelectorAll<HTMLElement>('article img, article pre.mermaid')
    .forEach((source) => {
      if (source.tagName === 'PRE' && !source.querySelector('svg')) return
      if (source.dataset.mediaBound) return
      source.dataset.mediaBound = 'true'
      source.tabIndex = 0
      source.setAttribute('role', 'button')
      const kind = source.tagName === 'PRE' ? 'diagram' : 'image'
      const description =
        source.tagName === 'PRE'
          ? source.closest('figure')?.querySelector('.diagram-label')?.textContent
          : source.getAttribute('alt')
      source.setAttribute(
        'aria-label',
        description ? `Open ${kind}: ${description}` : `Open ${kind} in viewer`,
      )
      source.addEventListener('click', (event) => {
        if ((event.target as Element).closest('a')) return
        openMediaViewer(source)
      })
      source.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openMediaViewer(source)
        }
      })
    })
  if (
    dialog?.open &&
    downloadSource &&
    activeSource?.isConnected &&
    activeSource.querySelector('svg') !== downloadSource &&
    activeSource !== downloadSource
  ) {
    dialog.close()
  }
}
