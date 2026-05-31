interface Props {
  platform: 'myrealtrip' | 'coupang' | 'ably'
  text: string
  url: string
}

const PLATFORM_STYLE: Record<Props['platform'], { bg: string; border: string; label: string }> = {
  myrealtrip: { bg: 'bg-blue-50', border: 'border-blue-200', label: '마이리얼트립' },
  coupang: { bg: 'bg-red-50', border: 'border-red-200', label: '쿠팡' },
  ably: { bg: 'bg-pink-50', border: 'border-pink-200', label: '에이블리' },
}

export default function AffiliateBlock({ platform, text, url }: Props) {
  const style = PLATFORM_STYLE[platform]

  return (
    <div className={`my-6 rounded-xl border ${style.border} ${style.bg} p-4`}>
      <p className="mb-2 text-xs text-gray-500">
        💡 제휴 링크 포함 — 구매 시 소정의 수수료가 지급됩니다
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
      >
        {text} →
      </a>
    </div>
  )
}
