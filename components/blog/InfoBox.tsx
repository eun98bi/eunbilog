import { ReactNode } from 'react'

interface Props {
  type: 'tip' | 'warning' | 'info'
  children: ReactNode
}

const STYLE = {
  tip: { border: 'border-green-200', bg: 'bg-green-50', icon: '✅', text: 'text-green-800' },
  warning: { border: 'border-yellow-200', bg: 'bg-yellow-50', icon: '⚠️', text: 'text-yellow-800' },
  info: { border: 'border-blue-200', bg: 'bg-blue-50', icon: 'ℹ️', text: 'text-blue-800' },
}

export default function InfoBox({ type, children }: Props) {
  const s = STYLE[type]
  return (
    <div className={`my-4 flex gap-3 rounded-xl border ${s.border} ${s.bg} p-4`}>
      <span>{s.icon}</span>
      <div className={`text-sm ${s.text}`}>{children}</div>
    </div>
  )
}
