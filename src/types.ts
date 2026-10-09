import type { BundledShikiTheme } from 'astro-expressive-code'
import type { CollectionEntry, DataEntryMap } from 'astro:content'

export interface FrontmatterImage {
  alt: string
  src: {
    height: number
    src: string
    width: number
    format: 'avif' | 'png' | 'webp' | 'jpeg' | 'jpg' | 'svg' | 'tiff' | 'gif'
  }
}

export interface Collation<CollectionType extends keyof DataEntryMap> {
  title: string
  url: string
  titleSlug: string
  entries: CollectionEntry<CollectionType>[]
}

export interface CollationGroup<CollectionType extends keyof DataEntryMap> {
  title: string
  url: string
  collations: Collation<CollectionType>[]
  sortCollationsMostRecent(): Collation<CollectionType>[]
  sortCollationsLargest(): Collation<CollectionType>[]
  add(item: CollectionEntry<CollectionType>, rawKey: string): void
  match(title: string): Collation<CollectionType> | undefined
  matchMany(titles: string[]): Collation<CollectionType>[] | undefined
}

export type NavLink = {
  name: string
  url: string
}

export type AdmonitionType = 'tip' | 'note' | 'important' | 'caution' | 'warning'

export const themeKeys = [
  'foreground',
  'background',
  'accent',
  'heading1',
  'heading2',
  'heading3',
  'heading4',
  'heading5',
  'heading6',
  'list',
  'separator',
  'italic',
  'link',
  'note',
  'tip',
  'important',
  'caution',
  'warning',
  'comment',
  'constant',
  'entity',
  'tag',
  'keyword',
  'string',
  'variable',
  'regexp',
  'blue',
  'green',
  'red',
  'yellow',
  'magenta',
  'cyan',
] as const

export type ThemeKey = (typeof themeKeys)[number]

export type TextmateStyles = {
  [key in ThemeKey]: string[]
}

export type ColorStyles = {
  [key in ThemeKey]: string
}

export type ThemesWithColorStyles = Partial<Record<BundledShikiTheme, ColorStyles>>
export type ThemeOverrides = Partial<Record<SiteTheme, Partial<ColorStyles>>>

export type SiteTheme = 'github-light' | 'github-dark'

export interface ThemesConfig {
  default: SiteTheme
  include: ['github-light', 'github-dark']
  overrides?: ThemeOverrides
}

export type SocialLinks = {
  github?: string
  twitter?: string
  mastodon?: string
  bluesky?: string
  linkedin?: string
  email?: string
  rss?: boolean
}

export type GiscusConfig = {
  repo: string
  repoId: string
  category: string
  categoryId: string
  reactionsEnabled: boolean
}

export interface FriendLink {
  name: string
  url: string
  description: string
  avatar: string
}

export interface SiteConfig {
  site: string
  title: string
  description: string
  author: string
  socialCardAvatarImage: string
  tags: string[]
  pageSize: number
  trailingSlashes: boolean
  themes: ThemesConfig
  socialLinks: SocialLinks
  navLinks: NavLink[]
  giscus: GiscusConfig | undefined
  characters: Record<string, string>
}
