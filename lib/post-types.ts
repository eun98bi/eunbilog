export type Category =
  | 'app-dev'
  | 'baseball'
  | 'tooltoolz'
  | 'affiliate'
  | 'gov-info'
  | 'side-hustle'
  | 'ai-news'
  | 'travel'

export const CATEGORIES: Category[] = [
  'app-dev',
  'baseball',
  'tooltoolz',
  'affiliate',
  'gov-info',
  'side-hustle',
  'ai-news',
  'travel',
]

export const CATEGORY_LABELS: Record<Category, string> = {
  'app-dev': '앱 개발기',
  baseball: '야구',
  tooltoolz: 'ToolToolz',
  affiliate: '제휴',
  'gov-info': '행정 정보',
  'side-hustle': '부업',
  'ai-news': 'AI 뉴스',
  travel: '여행',
}

export interface AffiliateLink {
  text: string
  url: string
  code?: string
}

export interface PostFrontmatter {
  title: string
  slug: string
  date: string
  category: Category
  tags: string[]
  excerpt: string
  coverImage: string | null
  published: boolean
  affiliate?: {
    platform: 'myrealtrip' | 'coupang' | 'ably' | null
    links?: AffiliateLink[]
  }
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
  }
}

export interface Post extends PostFrontmatter {
  id: string
  content: string
  readingTime: number
}
