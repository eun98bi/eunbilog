'use client'

import { useState } from 'react'
import { TIKTOK_PRODUCTS, searchTikTokProducts, type TikTokProduct } from '@/lib/tiktokshop'

export default function TikTokShopPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TikTokProduct[]>([])
  const [searched, setSearched] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setResults(searchTikTokProducts(query))
    setSearched(true)
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">틱톡샵 상품 링크</h1>
      <p className="mb-8 text-gray-500">
        영상에서 본 상품 이름이나 코드를 입력하면 구매 링크를 찾아드려요.
      </p>

      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="상품 이름 또는 코드 입력 (예: abc, 001)"
          className="flex-1 rounded-full border border-gray-200 px-5 py-3 text-sm focus:border-gray-900 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
        >
          검색
        </button>
      </form>

      {searched && results.length === 0 && (
        <p className="text-sm text-gray-400">
          일치하는 상품을 찾지 못했어요. 영상 설명란의 상품 코드를 다시 확인해주세요.
        </p>
      )}

      <ul className="space-y-4">
        {results.map((product) => (
          <li
            key={product.code}
            className="rounded-2xl border border-gray-200 p-5"
          >
            <div className="mb-1 text-xs font-medium text-gray-400">
              상품코드 {product.code}
            </div>
            <h2 className="mb-1 text-lg font-semibold text-gray-900">{product.name}</h2>
            {product.description && (
              <p className="mb-3 text-sm text-gray-500">{product.description}</p>
            )}
            <a
              href={product.amazonUrl}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="inline-block rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
            >
              아마존에서 구매하기 →
            </a>
          </li>
        ))}
      </ul>

      {!searched && (
        <div className="mt-12 text-xs text-gray-400">
          전체 상품 코드: {TIKTOK_PRODUCTS.map((p) => p.code).join(', ')}
        </div>
      )}
    </main>
  )
}
