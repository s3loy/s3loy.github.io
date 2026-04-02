import mermaid from 'mermaid'
import type { MermaidConfig } from 'mermaid'

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
  if (/^#[0-9a-f]{6}$/.test(hex)) {
    return [0, 2, 4].map((index) => Number.parseInt(hex.slice(index + 1, index + 3), 16)) as [
      number,
      number,
      number,
    ]
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

function getMermaidConfig(): MermaidConfig {
  const foreground = readThemeVar('--theme-foreground', '#1f2328')
  const background = readThemeVar('--theme-background', '#ffffff')
  const accent = readThemeVar('--theme-accent', foreground)
  const note = readThemeVar('--theme-note', accent)
  const tip = readThemeVar('--theme-tip', accent)
  const important = readThemeVar('--theme-important', accent)
  const warning = readThemeVar('--theme-warning', accent)
  const separator = readThemeVar('--theme-separator', foreground)
  const font = readThemeVar('--theme-font', 'JetBrains Mono Variable')

  return {
    startOnLoad: false,
    theme: 'base',
    look: 'classic',
    fontFamily: `${font}, monospace`,
    flowchart: {
      useMaxWidth: true,
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
}

function getMermaidBlocks(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(MERMAID_SELECTOR))
}

function resetMermaidBlocks(blocks: HTMLElement[]): void {
  for (const block of blocks) {
    const source = block.dataset.mermaidSource ?? block.textContent ?? ''
    const trimmedSource = source.trim()
    if (!trimmedSource) {
      continue
    }

    block.dataset.mermaidSource = trimmedSource
    block.dataset.mermaidRendered = 'false'
    block.removeAttribute('data-processed')
    block.textContent = trimmedSource
  }
}

async function renderMermaidBlocks(): Promise<void> {
  const blocks = getMermaidBlocks()
  if (!blocks.length) {
    return
  }

  resetMermaidBlocks(blocks)
  mermaid.initialize(getMermaidConfig())
  await mermaid.run({ nodes: blocks, suppressErrors: false })

  for (const block of blocks) {
    if (block.dataset.mermaidSource) {
      block.dataset.mermaidRendered = 'true'
    }
  }
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
  document.addEventListener('astro:page-load', queueMermaidRender)

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', queueMermaidRender, { once: true })
    return
  }

  queueMermaidRender()
}
