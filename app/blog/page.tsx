import { getAllPosts, CATEGORIES, CATEGORY_LABELS } from '@/lib/posts'
import PostCard from '@/components/blog/PostCard'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '블로그 — eunbilog',
  description: '앱 개발, 야구, 부업, 행정 정보까지 — 은비의 블로그',
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">블로그</h1>
      <p className="mb-8 text-gray-500">총 {posts.length}개의 글</p>

      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/blog/${cat}`}
            className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-600 transition hover:border-gray-900 hover:text-gray-900"
          >
            {CATEGORY_LABELS[cat]}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-400">아직 작성된 글이 없어요.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={`${post.category}-${post.slug}`} post={post} />
          ))}
        </div>
      )}
    </main>
  )
}
