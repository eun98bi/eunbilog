#!/usr/bin/env node
// Bulk/single post upsert for eunbilog. Bypasses RLS via the service role key,
// so this only ever runs locally (never in the browser).
//
// Usage: node scripts/post.mjs <path-to-post.json>
// <path-to-post.json> may contain a single post object or an array of them.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadEnvLocal } from './auto/lib/env.mjs'
import { upsertPostsRaw } from './auto/lib/upsertPost.mjs'

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Usage: node scripts/post.mjs <path-to-post.json>')
    process.exit(1)
  }

  loadEnvLocal()

  const raw = JSON.parse(readFileSync(resolve(filePath), 'utf-8'))
  const posts = Array.isArray(raw) ? raw : [raw]

  const data = await upsertPostsRaw(posts)

  console.log(`${data.length}개 게시글 업로드 완료:`)
  for (const row of data) {
    console.log(`  - [${row.category}] ${row.title} (${row.slug}) ${row.published ? '게시됨' : '초안'}`)
  }
}

main().catch((err) => {
  console.error('업로드 실패:', err.message)
  process.exit(1)
})
