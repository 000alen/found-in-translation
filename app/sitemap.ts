import { getBlogPosts } from 'app/blog/utils'

export const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ?? 'https://portfolio-blog-starter.vercel.app'

export default async function sitemap() {
  const blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  const routes = ['', '/books', '/books/shakespeare-sonnets', '/books/shakespeare-sonnets/sonnet-18'].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString().split('T')[0],
    })
  )

  return [...routes, ...blogs]
}
