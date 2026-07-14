'use client'

import { useState } from 'react'
import { bulkUpsertPosts } from '../actions'

export default function BulkUploadPage() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<{ successCount: number; errors: string[] } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    const res = await bulkUpsertPosts(text)
    setResult(res)
    setLoading(false)
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-gray-900">대량 업로드</h1>
      <p className="mb-4 text-sm text-gray-500">
        글 객체 배열(JSON)을 붙여넣어주세요. 각 글은 title, slug, category, date, tags,
        excerpt, content 필드를 포함해야 합니다. 동일한 (category, slug) 조합은 덮어씁니다.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={20}
        placeholder='[{"title":"...","slug":"...","category":"baseball","date":"2026-07-14","tags":["..."],"excerpt":"...","content":"...","published":true}]'
        className="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs"
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
        className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? '업로드 중...' : '업로드'}
      </button>

      {result && (
        <div className="mt-6 rounded-lg border border-gray-200 p-4 text-sm">
          <p className="font-medium text-green-700">{result.successCount}개 성공</p>
          {result.errors.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-red-600">
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
