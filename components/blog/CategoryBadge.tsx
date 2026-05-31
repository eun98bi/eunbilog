import { Category, CATEGORY_LABELS } from '@/lib/posts'

const COLOR_MAP: Record<Category, string> = {
  'app-dev': 'bg-blue-100 text-blue-700',
  baseball: 'bg-green-100 text-green-700',
  tooltoolz: 'bg-purple-100 text-purple-700',
  affiliate: 'bg-orange-100 text-orange-700',
  'gov-info': 'bg-gray-100 text-gray-700',
  'side-hustle': 'bg-yellow-100 text-yellow-700',
}

interface Props {
  category: Category
  className?: string
}

export default function CategoryBadge({ category, className = '' }: Props) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${COLOR_MAP[category]} ${className}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  )
}
