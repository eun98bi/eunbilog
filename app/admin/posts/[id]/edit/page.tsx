import { notFound } from 'next/navigation'
import { getPostById } from '@/lib/posts'
import PostForm from '../../../PostForm'
import { updatePost, deletePost } from '../../../actions'

interface Props {
  params: { id: string }
}

export default async function EditPostPage({ params }: Props) {
  const post = await getPostById(params.id)
  if (!post) notFound()

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">글 수정</h1>
      <PostForm post={post} action={updatePost.bind(null, post.id, post.category, post.slug)} />
      <form action={deletePost.bind(null, post.id, post.category, post.slug)} className="mt-6">
        <button
          type="submit"
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600"
        >
          삭제
        </button>
      </form>
    </div>
  )
}
