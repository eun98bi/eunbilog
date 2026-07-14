#!/usr/bin/env node
// Bulk/single post upsert for eunbilog. Bypasses RLS via the service role key,
// so this only ever runs locally (never in the browser).
//
// Usage: node scripts/post.mjs <path-to-post.json>
// <path-to-post.json> may contain a single post object or an array of them.

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const CATEGORIES = [
  'app-dev',
  'baseball',
  'tooltoolz',
  'affiliate',
  'gov-info',
  'side-hustle',
  'ai-news',
  'travel',
]

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (match && !(match[1] in process.env)) {
      process.env[match[1]] = match[2].trim()
    }
  }
}

function toRow(post) {
  if (!post.category || !CATEGORIES.includes(post.category)) {
    throw new Error(`유효하지 않은 카테고리: ${post.category} (slug: ${post.slug})`)
  }
  return {
    title: post.title,
    slug: post.slug,
    category: post.category,
    date: post.date,
    tags: post.tags ?? [],
    excerpt: post.excerpt,
    cover_image: post.coverImage ?? null,
    published: post.published ?? false,
    content: post.content,
    affiliate: post.affiliate ?? null,
    seo: post.seo ?? null,
  }
}

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Usage: node scripts/post.mjs <path-to-post.json>')
    process.exit(1)
  }

  loadEnvLocal()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 .env.local에 없습니다.')
    process.exit(1)
  }

  const raw = JSON.parse(readFileSync(resolve(filePath), 'utf-8'))
  const posts = Array.isArray(raw) ? raw : [raw]
  const rows = posts.map(toRow)

  const supabase = createClient(supabaseUrl, serviceKey)
  const { data, error } = await supabase
    .from('posts')
    .upsert(rows, { onConflict: 'category,slug' })
    .select('title, category, slug, published')

  if (error) {
    console.error('업로드 실패:', error.message)
    process.exit(1)
  }

  console.log(`${data.length}개 게시글 업로드 완료:`)
  for (const row of data) {
    console.log(`  - [${row.category}] ${row.title} (${row.slug}) ${row.published ? '게시됨' : '초안'}`)
  }
}

main()
