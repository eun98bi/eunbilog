'use client'

import { CATEGORIES, CATEGORY_LABELS, Post } from '@/lib/post-types'

interface Props {
  action: (formData: FormData) => void
  post?: Post
}

export default function PostForm({ action, post }: Props) {
  return (
    <form action={action} className="flex max-w-2xl flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">제목</span>
        <input
          name="title"
          required
          defaultValue={post?.title}
          className="rounded-lg border border-gray-200 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">슬러그 (URL)</span>
        <input
          name="slug"
          required
          defaultValue={post?.slug}
          className="rounded-lg border border-gray-200 px-3 py-2"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">카테고리</span>
          <select
            name="category"
            required
            defaultValue={post?.category ?? CATEGORIES[0]}
            className="rounded-lg border border-gray-200 px-3 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">날짜</span>
          <input
            type="date"
            name="date"
            required
            defaultValue={post?.date}
            className="rounded-lg border border-gray-200 px-3 py-2"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">태그 (쉼표로 구분)</span>
        <input
          name="tags"
          defaultValue={post?.tags.join(', ')}
          className="rounded-lg border border-gray-200 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">요약 (excerpt)</span>
        <textarea
          name="excerpt"
          required
          rows={2}
          defaultValue={post?.excerpt}
          className="rounded-lg border border-gray-200 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">커버 이미지 URL (선택)</span>
        <input
          name="coverImage"
          defaultValue={post?.coverImage ?? ''}
          className="rounded-lg border border-gray-200 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">본문 (Markdown)</span>
        <textarea
          name="content"
          required
          rows={16}
          defaultValue={post?.content}
          className="rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">제휴 링크 JSON (선택)</span>
        <textarea
          name="affiliate"
          rows={3}
          placeholder='{"platform":"coupang","links":[{"text":"보러가기","url":"https://..."}]}'
          defaultValue={post?.affiliate ? JSON.stringify(post.affiliate) : ''}
          className="rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">SEO JSON (선택)</span>
        <textarea
          name="seo"
          rows={2}
          placeholder='{"metaTitle":"...","metaDescription":"...","keywords":["..."]}'
          defaultValue={post?.seo ? JSON.stringify(post.seo) : ''}
          className="rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs"
        />
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="published" defaultChecked={post?.published ?? false} />
        <span className="text-sm font-medium text-gray-700">게시 (published)</span>
      </label>

      <button
        type="submit"
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
      >
        {post ? '수정 저장' : '작성'}
      </button>
    </form>
  )
}
