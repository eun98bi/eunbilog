import Link from 'next/link'
import Image from 'next/image'
import { Post } from '@/lib/posts'
import CategoryBadge from './CategoryBadge'

interface Props {
  post: Post
}

export default function PostCard({ post }: Props) {
  const href = `/blog/${post.category}/${post.slug}`

  return (
    <article className="flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      {post.coverImage && (
        <Link href={href} className="overflow-hidden rounded-t-xl">
          <Image
            src={post.coverImage}
            alt={post.title}
            width={640}
            height={360}
            className="h-48 w-full object-cover transition hover:scale-105"
          />
        </Link>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <CategoryBadge category={post.category} />
          <span className="text-xs text-gray-400">{post.date}</span>
          <span className="ml-auto text-xs text-gray-400">{post.readingTime}분</span>
        </div>
        <Link href={href}>
          <h2 className="line-clamp-2 font-semibold text-gray-900 hover:text-blue-600">
            {post.title}
          </h2>
        </Link>
        <p className="line-clamp-3 text-sm text-gray-500">{post.excerpt}</p>
        <div className="mt-auto flex flex-wrap gap-1 pt-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-400">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
