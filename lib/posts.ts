import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content/blog')

export type Category =
  | 'app-dev'
  | 'baseball'
  | 'tooltoolz'
  | 'affiliate'
  | 'gov-info'
  | 'side-hustle'

export const CATEGORIES: Category[] = [
  'app-dev',
  'baseball',
  'tooltoolz',
  'affiliate',
  'gov-info',
  'side-hustle',
]

export const CATEGORY_LABELS: Record<Category, string> = {
  'app-dev': '앱 개발기',
  baseball: '야구',
  tooltoolz: 'ToolToolz',
  affiliate: '제휴',
  'gov-info': '행정 정보',
  'side-hustle': '부업',
}

export interface AffiliateLink {
  text: string
  url: string
  code?: string
}

export interface PostFrontmatter {
  title: string
  slug: string
  date: string
  category: Category
  tags: string[]
  excerpt: string
  coverImage: string | null
  published: boolean
  affiliate?: {
    platform: 'myrealtrip' | 'coupang' | 'ably' | null
    links?: AffiliateLink[]
  }
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
  }
}

export interface Post extends PostFrontmatter {
  content: string
  readingTime: number
}

function calcReadingTime(content: string): number {
  const words = content.replace(/[^가-힣a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean)
  return Math.max(1, Math.ceil(words.length / 250))
}

export function getPostBySlug(category: Category, slug: string): Post | null {
  const filePath = path.join(CONTENT_DIR, category, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  return {
    ...(data as PostFrontmatter),
    content,
    readingTime: calcReadingTime(content),
  }
}

export function getPostsByCategory(category: Category, publishedOnly = true): Post[] {
  const dir = path.join(CONTENT_DIR, category)
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => getPostBySlug(category, f.replace('.mdx', '')))
    .filter((p): p is Post => p !== null && (!publishedOnly || p.published))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getAllPosts(publishedOnly = true): Post[] {
  return CATEGORIES.flatMap((cat) => getPostsByCategory(cat, publishedOnly)).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getRecentPosts(count = 6, publishedOnly = true): Post[] {
  return getAllPosts(publishedOnly).slice(0, count)
}

export function getPostsByCategoryMap(publishedOnly = true): Record<Category, Post[]> {
  return Object.fromEntries(
    CATEGORIES.map((cat) => [cat, getPostsByCategory(cat, publishedOnly)])
  ) as Record<Category, Post[]>
}
