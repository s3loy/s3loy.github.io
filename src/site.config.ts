import type { SiteConfig } from '~/types'

const config: SiteConfig = {
  site: 'https://blog.s3loy.tech',
  title: "s3loy's blog",
  description: 'Neither emo nor demo',
  author: 's3loy',
  tags: [],
  socialCardAvatarImage: './src/content/avatar.jpg',
  pageSize: 15,
  trailingSlashes: false,
  navLinks: [
    {
      name: 'Home',
      url: '/',
    },
    {
      name: 'About',
      url: '/about',
    },
    {
      name: 'Archives',
      url: '/archives',
    },
    {
      name: 'Friends',
      url: '/friends',
    },
  ],
  themes: {
    default: 'github-dark',
    include: ['github-light', 'github-dark'],
  },
  socialLinks: {
    github: 'https://github.com/s3loy',
    email: 'justs3loy@gmail.com',
    rss: true,
  },
  giscus: undefined,
  characters: {
    devil1: '/devil1.webp',
  },
}

export default config
