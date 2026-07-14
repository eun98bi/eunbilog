import { ReactNode } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './actions'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return <>{children}</>

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <nav className="mb-8 flex items-center gap-4 border-b border-gray-100 pb-4 text-sm">
        <Link href="/admin" className="font-semibold text-gray-900">
          관리자
        </Link>
        <Link href="/admin/posts/new" className="text-gray-500 hover:text-gray-900">
          새 글
        </Link>
        <Link href="/admin/bulk" className="text-gray-500 hover:text-gray-900">
          대량 업로드
        </Link>
        <form action={signOut} className="ml-auto">
          <button type="submit" className="text-gray-400 hover:text-gray-700">
            로그아웃
          </button>
        </form>
      </nav>
      {children}
    </div>
  )
}
