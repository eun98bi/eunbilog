export interface TikTokProduct {
  code: string
  name: string
  amazonUrl: string
  image?: string
  description?: string
}

export const TIKTOK_PRODUCTS: TikTokProduct[] = [
  {
    code: '001',
    name: 'SK-II Facial Treatment Clear Lotion',
    amazonUrl: 'https://amzn.to/4efiLum',
    image: '/images/tiktokshop/001.jpg',
    description: 'As seen in our TikTok video.',
  },
]

export function findTikTokProduct(query: string): TikTokProduct | undefined {
  const q = query.trim().toLowerCase()
  if (!q) return undefined
  return TIKTOK_PRODUCTS.find(
    (p) => p.code.toLowerCase() === q || p.name.toLowerCase() === q
  )
}

export function searchTikTokProducts(query: string): TikTokProduct[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return TIKTOK_PRODUCTS.filter(
    (p) => p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
  )
}
