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
      <h1 className="mb-2 text-3xl font-bold text-gray-900">TikTok Shop Product Links</h1>
      <p className="mb-8 text-gray-500">
        Enter the product name or code from the video to find the purchase link.
      </p>

      <form onSubmit={handleSearch} className="mb-8 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter product name or code (e.g. abc, 001)"
          className="flex-1 rounded-full border border-gray-200 px-5 py-3 text-sm focus:border-gray-900 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
        >
          Search
        </button>
      </form>

      {searched && results.length === 0 && (
        <p className="text-sm text-gray-400">
          No matching product found. Please check the product code from the video description.
        </p>
      )}

      <ul className="space-y-4">
        {results.map((product) => (
          <li
            key={product.code}
            className="rounded-2xl border border-gray-200 p-5"
          >
            {product.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image}
                alt={product.name}
                className="mb-3 w-full max-w-xs rounded-xl object-cover"
              />
            )}
            <div className="mb-1 text-xs font-medium text-gray-400">
              Product code {product.code}
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
              Shop on Amazon →
            </a>
          </li>
        ))}
      </ul>

      {!searched && (
        <div className="mt-12 text-xs text-gray-400">
          All product codes: {TIKTOK_PRODUCTS.map((p) => p.code).join(', ')}
        </div>
      )}
    </main>
  )
}
