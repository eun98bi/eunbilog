import { notFound } from 'next/navigation'
import { CATEGORIES, CATEGORY_LABELS, getPostsByCategory, Category } from '@/lib/posts'
import PostCard from '@/components/blog/PostCard'
import Link from 'next/link'
import { Metadata } from 'next'

interface Props {
  params: { category: string }
}

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }))
}

export function generateMetadata({ params }: Props): Metadata {
  const category = params.category as Category
  if (!CATEGORIES.includes(category)) return {}
  return {
    title: `${CATEGORY_LABELS[category]} — eunbilog`,
  }
}

export default function CategoryPage({ params }: Props) {
  const category = params.category as Category
  if (!CATEGORIES.includes(category)) notFound()

  const posts = getPostsByCategory(category)

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/blog" className="hover:text-gray-700">
          블로그
        </Link>
        <span>/</span>
        <span>{CATEGORY_LABELS[category]}</span>
      </div>

      <h1 className="mb-2 text-3xl font-bold text-gray-900">{CATEGORY_LABELS[category]}</h1>
      <p className="mb-8 text-gray-500">{posts.length}개의 글</p>

      {posts.length === 0 ? (
        <p className="text-gray-400">아직 작성된 글이 없어요.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </main>
  )
}
