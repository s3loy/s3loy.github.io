export const articleLanguages = { zh: '中', en: 'En' } as const

export type ArticleLanguage = keyof typeof articleLanguages

interface Article {
  id: string
  data: { lang: ArticleLanguage; translationKey?: string }
}

export function getArticleVersions<T extends Article>(post: T, posts: T[]): T[] {
  const key = post.data.translationKey
  if (!key) return [post]
  const versions = posts.filter((candidate) => candidate.data.translationKey === key)
  const seen = new Set<ArticleLanguage>()
  for (const version of versions) {
    if (seen.has(version.data.lang)) {
      throw new Error(
        `Duplicate article language "${version.data.lang}" for translationKey "${key}"`,
      )
    }
    seen.add(version.data.lang)
  }
  return versions.sort(
    (a, b) => Number(a.data.lang === 'en') - Number(b.data.lang === 'en'),
  )
}

export function getArticleList<T extends Article>(
  posts: T[],
  language: ArticleLanguage,
): T[] {
  const selected = new Map<string, T>()
  for (const post of posts) {
    const key = post.data.translationKey
      ? `translation:${post.data.translationKey}`
      : `article:${post.id}`
    if (!selected.has(key) || post.data.lang === language) selected.set(key, post)
  }
  return [...selected.values()]
}
