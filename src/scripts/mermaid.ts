import { setupMediaViewer, openMediaViewer } from './media-viewer'
import mermaid from 'mermaid'
import { namespaceSVG } from './svg-ids'
import type { MermaidConfig } from 'mermaid'

mermaid.initialize({ startOnLoad: false })

const MERMAID_SELECTOR = 'pre.mermaid'

let renderQueued = false
let renderRunning = false
let isSetup = false
let themeObserver: MutationObserver | undefined

function readThemeVar(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

function parseColor(value: string): [number, number, number] | null {
  const hex = value.trim().toLowerCase()
  if (/^#[0-9a-f]{3}$/.test(hex)) {
    return [...hex.slice(1)].map((part) => Number.parseInt(part.repeat(2), 16)) as [
      number,
      number,
      number,
    ]
  }
  if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/.test(hex)) {
    return [0, 2, 4].map((index) =>
      Number.parseInt(hex.slice(index + 1, index + 3), 16),
    ) as [number, number, number]
  }

  const rgbMatch = value.match(
    /rgba?\(\s*(?<r>\d{1,3})\s*,\s*(?<g>\d{1,3})\s*,\s*(?<b>\d{1,3})(?:\s*,\s*[\d.]+\s*)?\)/i,
  )
  if (!rgbMatch?.groups) {
    return null
  }

  return [
    Number.parseInt(rgbMatch.groups.r, 10),
    Number.parseInt(rgbMatch.groups.g, 10),
    Number.parseInt(rgbMatch.groups.b, 10),
  ]
}

function mixColors(base: string, accent: string, accentWeight: number): string {
  const baseRgb = parseColor(base)
  const accentRgb = parseColor(accent)
  if (!baseRgb || !accentRgb) {
    return base
  }

  const mixChannel = (index: number) =>
    Math.round(baseRgb[index] * (1 - accentWeight) + accentRgb[index] * accentWeight)

  return `rgb(${mixChannel(0)}, ${mixChannel(1)}, ${mixChannel(2)})`
}

function getMermaidConfig(editorial = false): MermaidConfig {
  const foreground = readThemeVar('--theme-foreground', '#1f2328')
  const background = readThemeVar('--theme-background', '#ffffff')
  const accent = readThemeVar('--theme-accent', foreground)
  const note = readThemeVar('--theme-note', accent)
  const tip = readThemeVar('--theme-tip', accent)
  const important = readThemeVar('--theme-important', accent)
  const warning = readThemeVar('--theme-warning', accent)
  const separator = readThemeVar('--theme-separator', foreground)
  const font = readThemeVar('--theme-font', 'JetBrains Mono Variable')

  const config: MermaidConfig = {
    startOnLoad: false,
    theme: 'base',
    look: 'classic',
    fontFamily: `${font}, monospace`,
    sequence: {
      useMaxWidth: true,
      wrap: false,
      mirrorActors: true,
    },
    flowchart: {
      useMaxWidth: true,
      curve: 'basis',
      padding: 18,
    },
    themeVariables: {
      fontFamily: `${font}, monospace`,
      background,
      mainBkg: background,
      textColor: foreground,
      lineColor: separator,
      primaryColor: mixColors(background, accent, 0.12),
      primaryBorderColor: accent,
      primaryTextColor: foreground,
      secondaryColor: mixColors(background, tip, 0.12),
      secondaryBorderColor: tip,
      secondaryTextColor: foreground,
      tertiaryColor: mixColors(background, important, 0.12),
      tertiaryBorderColor: important,
      tertiaryTextColor: foreground,
      clusterBkg: mixColors(background, foreground, 0.04),
      clusterBorder: separator,
      edgeLabelBackground: mixColors(background, foreground, 0.08),
      noteBkgColor: mixColors(background, note, 0.14),
      noteBorderColor: note,
      noteTextColor: foreground,
      actorBkg: mixColors(background, accent, 0.1),
      actorBorder: accent,
      actorTextColor: foreground,
      activationBkgColor: mixColors(background, tip, 0.1),
      activationBorderColor: tip,
      sequenceNumberColor: warning,
      labelBoxBkgColor: mixColors(background, foreground, 0.08),
      labelBoxBorderColor: separator,
      labelTextColor: foreground,
      signalColor: separator,
      signalTextColor: foreground,
    },
  }
  if (editorial) {
    const diagramFont =
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    config.fontFamily = diagramFont
    Object.assign(config.sequence!, {
      actorFontFamily: diagramFont,
      messageFontFamily: diagramFont,
      noteFontFamily: diagramFont,
      actorFontSize: 16,
      messageFontSize: 16,
      noteFontSize: 14,
      actorFontWeight: 600,
      actorMargin: 40,
      messageMargin: 36,
      width: 120,
      height: 48,
      diagramMarginX: 20,
      diagramMarginY: 20,
    })
    Object.assign(config.themeVariables!, {
      fontFamily: diagramFont,
      actorBkg: mixColors(background, accent, 0.06),
      actorBorder: mixColors(background, foreground, 0.25),
      actorLineColor: mixColors(background, foreground, 0.2),
      signalColor: mixColors(background, foreground, 0.65),
      noteBkgColor: mixColors(background, warning, 0.07),
      noteBorderColor: mixColors(background, warning, 0.3),
      sequenceNumberColor: background,
    })
  }
  return config
}

function getMermaidBlocks(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(MERMAID_SELECTOR))
}

function prepareDiagram(block: HTMLElement, index: number) {
  if (block.parentElement?.classList.contains('diagram-figure')) return
  const figure = document.createElement('figure')
  figure.className = 'diagram-figure'
  const caption = document.createElement('figcaption')
  caption.className = 'diagram-caption'
  const label = document.createElement('span')
  label.className = 'diagram-label'
  label.textContent = `DIAGRAM ${String(index + 1).padStart(2, '0')}`
  const expand = document.createElement('button')
  expand.type = 'button'
  expand.textContent = 'Expand ↗'
  expand.setAttribute('aria-label', `Expand diagram ${index + 1}`)
  expand.addEventListener('click', () => openMediaViewer(block))
  caption.append(label, expand)
  block.before(figure)
  figure.append(caption, block)
}

async function renderMermaidBlocks(): Promise<void> {
  const blocks = getMermaidBlocks()
  if (!blocks.length) return
  await document.fonts.ready
  let rendered = 0
  for (const [index, block] of blocks.entries()) {
    const source = (block.dataset.mermaidSource ?? block.textContent ?? '').trim()
    if (!source) continue
    const editorial = /^%% @style editorial$/m.test(source)
    mermaid.initialize(getMermaidConfig(editorial))
    prepareDiagram(block, index)
    const figure = block.parentElement!
    figure.classList.toggle('diagram-figure--editorial', editorial)
    const title = source.match(/^%% @title (.+)$/m)?.[1]
    const label = figure.querySelector('.diagram-label')
    if (label)
      label.textContent = title || `DIAGRAM ${String(index + 1).padStart(2, '0')}`
    const previousHeight = block.getBoundingClientRect().height
    if (block.querySelector('svg')) block.style.minHeight = `${previousHeight}px`
    block.dataset.mermaidSource = source
    block.dataset.mermaidRendered = 'false'
    block.setAttribute('aria-busy', 'true')
    block.removeAttribute('data-processed')
    block.removeAttribute('data-render-error')
    block.textContent = source
    const button = block.parentElement?.querySelector('button')
    if (button) button.disabled = true
    try {
      await mermaid.run({ nodes: [block], suppressErrors: false })
      const svg = block.querySelector('svg')
      if (!svg) throw new Error('Mermaid returned no SVG')
      namespaceSVG(svg, `diagram-${index + 1}-`)
      block.dataset.mermaidRendered = 'true'
      rendered += 1
      if (button) button.disabled = false
    } catch (error) {
      block.dataset.renderError = 'true'
      block.textContent = `Diagram could not be rendered. Source:\n\n${source}`
      console.error('[mermaid] Diagram render failed', { index, error })
    } finally {
      block.removeAttribute('aria-busy')
      block.style.removeProperty('min-height')
    }
  }
  setupMediaViewer()
  console.debug('[mermaid] Render complete', { rendered, total: blocks.length })
}

async function flushRenderQueue(): Promise<void> {
  if (renderRunning || !renderQueued) {
    return
  }

  renderRunning = true
  try {
    while (renderQueued) {
      renderQueued = false
      await renderMermaidBlocks()
    }
  } catch (error) {
    console.error('Failed to render Mermaid diagrams.', error)
  } finally {
    renderRunning = false
  }
}

function queueMermaidRender(): void {
  renderQueued = true
  void flushRenderQueue()
}

function observeThemeChanges(): void {
  if (themeObserver) {
    return
  }

  themeObserver = new MutationObserver((mutations) => {
    if (
      mutations.some(
        (mutation) =>
          mutation.type === 'attributes' && mutation.attributeName === 'data-theme',
      )
    ) {
      queueMermaidRender()
    }
  })

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
}

export function setupMermaid(): void {
  if (isSetup) {
    queueMermaidRender()
    return
  }

  isSetup = true
  observeThemeChanges()

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', queueMermaidRender, { once: true })
    return
  }

  queueMermaidRender()
}
