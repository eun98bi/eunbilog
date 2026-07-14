import Link from 'next/link'
import { getAllPosts, CATEGORY_LABELS } from '@/lib/posts'
import { deletePost } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const posts = await getAllPosts(false)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">글 목록 ({posts.length})</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/posts/new"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          >
            새 글
          </Link>
          <Link
            href="/admin/bulk"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700"
          >
            대량 업로드
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-400">아직 작성된 글이 없어요.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="py-2">제목</th>
              <th className="py-2">카테고리</th>
              <th className="py-2">날짜</th>
              <th className="py-2">게시</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-gray-100">
                <td className="py-2">{post.title}</td>
                <td className="py-2">{CATEGORY_LABELS[post.category]}</td>
                <td className="py-2">{post.date}</td>
                <td className="py-2">{post.published ? '✅' : '초안'}</td>
                <td className="flex gap-3 py-2">
                  <Link href={`/admin/posts/${post.id}/edit`} className="text-blue-600 hover:underline">
                    수정
                  </Link>
                  <form action={deletePost.bind(null, post.id, post.category, post.slug)}>
                    <button type="submit" className="text-red-600 hover:underline">
                      삭제
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
