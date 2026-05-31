import { notFound } from 'next/navigation'
import { CATEGORIES, Category, getPostBySlug, getPostsByCategory } from '@/lib/posts'
import { MDXRemote } from 'next-mdx-remote/rsc'
import CategoryBadge from '@/components/blog/CategoryBadge'
import AffiliateBlock from '@/components/blog/AffiliateBlock'
import ToolToolzBanner from '@/components/blog/ToolToolzBanner'
import InfoBox from '@/components/blog/InfoBox'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'

interface Props {
  params: { category: string; slug: string }
}

const components = { AffiliateBlock, ToolToolzBanner, InfoBox }

export async function generateStaticParams() {
  return CATEGORIES.flatMap((category) =>
    getPostsByCategory(category).map((post) => ({ category, slug: post.slug }))
  )
}

export function generateMetadata({ params }: Props): Metadata {
  const category = params.category as Category
  if (!CATEGORIES.includes(category)) return {}

  const post = getPostBySlug(category, params.slug)
  if (!post) return {}

  return {
    title: post.seo?.metaTitle ?? post.title,
    description: post.seo?.metaDescription ?? post.excerpt,
    keywords: post.seo?.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  }
}

export default function PostPage({ params }: Props) {
  const category = params.category as Category
  if (!CATEGORIES.includes(category)) notFound()

  const post = getPostBySlug(category, params.slug)
  if (!post || !post.published) notFound()

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/blog" className="hover:text-gray-700">블로그</Link>
        <span>/</span>
        <Link href={`/blog/${category}`} className="hover:text-gray-700">
          {post.category}
        </Link>
      </div>

      {post.coverImage && (
        <Image
          src={post.coverImage}
          alt={post.title}
          width={800}
          height={450}
          className="mb-8 w-full rounded-xl object-cover"
        />
      )}

      <div className="mb-4 flex items-center gap-3">
        <CategoryBadge category={post.category} />
        <span className="text-sm text-gray-400">{post.date}</span>
        <span className="text-sm text-gray-400">· {post.readingTime}분</span>
      </div>

      <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900">{post.title}</h1>
      <p className="mb-8 text-lg text-gray-500">{post.excerpt}</p>

      <article className="prose prose-gray max-w-none">
        <MDXRemote source={post.content} components={components} />
      </article>

      <div className="mt-12 flex flex-wrap gap-2 border-t border-gray-100 pt-6">
        {post.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">
            #{tag}
          </span>
        ))}
      </div>
    </main>
  )
}
