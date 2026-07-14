'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES, Category } from '@/lib/posts'

interface PostInput {
  title: string
  slug: string
  category: Category
  date: string
  tags: string[]
  excerpt: string
  cover_image: string | null
  published: boolean
  content: string
  affiliate: unknown | null
  seo: unknown | null
}

function parseFormData(formData: FormData): PostInput {
  const category = formData.get('category') as Category
  if (!CATEGORIES.includes(category)) {
    throw new Error(`유효하지 않은 카테고리입니다: ${category}`)
  }

  const affiliateRaw = (formData.get('affiliate') as string)?.trim()
  const seoRaw = (formData.get('seo') as string)?.trim()

  return {
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    category,
    date: formData.get('date') as string,
    tags: (formData.get('tags') as string)
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    excerpt: formData.get('excerpt') as string,
    cover_image: (formData.get('coverImage') as string)?.trim() || null,
    published: formData.get('published') === 'on',
    content: formData.get('content') as string,
    affiliate: affiliateRaw ? JSON.parse(affiliateRaw) : null,
    seo: seoRaw ? JSON.parse(seoRaw) : null,
  }
}

function revalidatePostPaths(category: string, slug: string) {
  revalidatePath('/')
  revalidatePath('/blog')
  revalidatePath(`/blog/${category}`)
  revalidatePath(`/blog/${category}/${slug}`)
}

export async function createPost(formData: FormData) {
  const input = parseFormData(formData)
  const supabase = createClient()
  const { error } = await supabase.from('posts').insert(input)
  if (error) throw new Error(error.message)

  revalidatePostPaths(input.category, input.slug)
  redirect('/admin')
}

export async function updatePost(
  id: string,
  prevCategory: string,
  prevSlug: string,
  formData: FormData
) {
  const input = parseFormData(formData)
  const supabase = createClient()
  const { error } = await supabase.from('posts').update(input).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePostPaths(prevCategory, prevSlug)
  revalidatePostPaths(input.category, input.slug)
  redirect('/admin')
}

export async function deletePost(id: string, category: string, slug: string) {
  const supabase = createClient()
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePostPaths(category, slug)
  redirect('/admin')
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

export async function bulkUpsertPosts(
  jsonText: string
): Promise<{ successCount: number; errors: string[] }> {
  let rows: Record<string, unknown>[]
  try {
    const parsed = JSON.parse(jsonText)
    rows = Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    return { successCount: 0, errors: ['JSON 파싱 실패: 형식을 확인해주세요.'] }
  }

  const supabase = createClient()
  const errors: string[] = []
  let successCount = 0

  for (const row of rows) {
    const slug = row.slug as string | undefined
    const category = row.category as string | undefined

    if (!category || !CATEGORIES.includes(category as Category)) {
      errors.push(`${slug ?? '(no slug)'}: 유효하지 않은 카테고리 "${category}"`)
      continue
    }

    const payload = {
      title: row.title,
      slug,
      category,
      date: row.date,
      tags: row.tags ?? [],
      excerpt: row.excerpt,
      cover_image: row.coverImage ?? null,
      published: row.published ?? false,
      content: row.content,
      affiliate: row.affiliate ?? null,
      seo: row.seo ?? null,
    }

    const { error } = await supabase
      .from('posts')
      .upsert(payload, { onConflict: 'category,slug' })

    if (error) {
      errors.push(`${slug}: ${error.message}`)
    } else {
      successCount++
      revalidatePostPaths(category, slug!)
    }
  }

  return { successCount, errors }
}
