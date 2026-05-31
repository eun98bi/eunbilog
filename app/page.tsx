import Link from 'next/link'
import { getRecentPosts, CATEGORIES, CATEGORY_LABELS } from '@/lib/posts'
import PostCard from '@/components/blog/PostCard'

export default function HomePage() {
  const recentPosts = getRecentPosts(6)

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900">eunbilog</h1>
        <p className="mb-8 text-xl text-gray-500">
          앱 개발, 야구, 부업, 행정 정보까지<br />직접 겪은 것들을 기록합니다
        </p>
        <Link
          href="/blog"
          className="inline-block rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
        >
          블로그 보기 →
        </Link>
      </section>

      {/* 카테고리 */}
      <section className="mx-auto max-w-4xl px-4 pb-12">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">카테고리</h2>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/blog/${cat}`}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:border-gray-900 hover:text-gray-900"
            >
              {CATEGORY_LABELS[cat]}
            </Link>
          ))}
        </div>
      </section>

      {/* 최근 글 */}
      {recentPosts.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 pb-20">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">최근 글</h2>
            <Link href="/blog" className="text-sm text-gray-400 hover:text-gray-700">
              전체 보기 →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <PostCard key={`${post.category}-${post.slug}`} post={post} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
