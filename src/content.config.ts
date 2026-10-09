import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'
import { slug } from 'github-slugger'

const postsCollection = defineCollection({
  loader: glob({
    pattern: ['{zh,en}/**/*.md', '{zh,en}/**/*.mdx'],
    base: './src/content/posts',
    generateId: ({ entry, data }) => {
      const language = entry.split('/')[0]
      if (data.lang !== language)
        throw new Error(`Article language does not match directory: ${entry}`)
      return (
        slug(entry.replace(/^(zh|en)\//, '').replace(/\.mdx?$/, '')) +
        (language === 'en' ? '-en' : '')
      )
    },
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      lang: z.enum(['zh', 'en']).default('zh'),
      translationKey: z.string().trim().min(1).optional(),
      published: z.coerce.date(),
      modified: z.coerce.date().optional(),
      pin: z.boolean().optional().default(false),
      draft: z.boolean().optional().default(false),
      description: z.string().optional(),
      author: z.string().optional(),
      series: z.string().optional(),
      tags: z.array(z.string()).optional().default([]),
      coverImage: z
        .strictObject({
          src: image(),
          alt: z.string(),
        })
        .optional(),
      toc: z.boolean().optional().default(true),
    }),
})

const homeCollection = defineCollection({
  loader: glob({ pattern: ['home.md', 'home.mdx'], base: './src/content' }),
  schema: ({ image }) =>
    z.object({
      avatarImage: z
        .object({
          src: image(),
          alt: z.string().optional().default('My avatar'),
        })
        .optional(),
    }),
})

export const collections = {
  posts: postsCollection,
  home: homeCollection,
}
