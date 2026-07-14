import PostForm from '../../PostForm'
import { createPost } from '../../actions'

export default function NewPostPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">새 글 작성</h1>
      <PostForm action={createPost} />
    </div>
  )
}
