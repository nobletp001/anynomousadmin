'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { authQueryKey, authQueryFn } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

export default function RootPage() {
  const router = useRouter()

  const { data: user, isLoading } = useQuery({
    queryKey: authQueryKey,
    queryFn: authQueryFn,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  useEffect(() => {
    if (!isLoading) {
      router.replace(user ? '/dashboard' : '/login')
    }
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      <p className="text-sm font-medium">Loading console...</p>
    </div>
  )
}
