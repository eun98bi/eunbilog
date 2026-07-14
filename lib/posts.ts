import { createClient } from '@/lib/supabase/server'
import { Category, Post, PostFrontmatter } from '@/lib/post-types'

export * from '@/lib/post-types'

interface PostRow {
  id: string
  title: string
  slug: string
  category: Category
  date: string
  tags: string[]
  excerpt: string
  cover_image: string | null
  published: boolean
  content: string
  affiliate: PostFrontmatter['affiliate'] | null
  seo: PostFrontmatter['seo'] | null
}

function calcReadingTime(content: string): number {
  const words = content.replace(/[^가-힣a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean)
  return Math.max(1, Math.ceil(words.length / 250))
}

function toPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    date: row.date,
    tags: row.tags,
    excerpt: row.excerpt,
    coverImage: row.cover_image,
    published: row.published,
    affiliate: row.affiliate ?? undefined,
    seo: row.seo ?? undefined,
    content: row.content,
    readingTime: calcReadingTime(row.content),
  }
}

export async function getPostBySlug(category: Category, slug: string): Promise<Post | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('category', category)
    .eq('slug', slug)
    .maybeSingle()

  return data ? toPost(data as PostRow) : null
}

export async function getPostsByCategory(category: Category, publishedOnly = true): Promise<Post[]> {
  const supabase = createClient()
  let query = supabase.from('posts').select('*').eq('category', category)
  if (publishedOnly) query = query.eq('published', true)

  const { data } = await query.order('date', { ascending: false })
  return (data as PostRow[] | null)?.map(toPost) ?? []
}

export async function getAllPosts(publishedOnly = true): Promise<Post[]> {
  const supabase = createClient()
  let query = supabase.from('posts').select('*')
  if (publishedOnly) query = query.eq('published', true)

  const { data } = await query.order('date', { ascending: false })
  return (data as PostRow[] | null)?.map(toPost) ?? []
}

export async function getRecentPosts(count = 6, publishedOnly = true): Promise<Post[]> {
  const posts = await getAllPosts(publishedOnly)
  return posts.slice(0, count)
}

export async function getPostById(id: string): Promise<Post | null> {
  const supabase = createClient()
  const { data } = await supabase.from('posts').select('*').eq('id', id).maybeSingle()
  return data ? toPost(data as PostRow) : null
}
