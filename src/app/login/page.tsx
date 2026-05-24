'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth-service'
import { authQueryKey, authQueryFn, ADMIN_ROLES } from '@/lib/auth'
import { Button, Input } from '@/components/ui'
import { Mail, Lock, Eye, EyeOff, ShieldAlert, AlertCircle } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false)

  const { data: user, isLoading: authLoading } = useQuery({
    queryKey: authQueryKey,
    queryFn: authQueryFn,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await authService.login(email, password)
      if (!response.success || !ADMIN_ROLES.includes(response.data.user.role as any)) {
        throw new Error('Access denied. Admin privileges required.')
      }
      localStorage.setItem('admin_token', response.data.token)
      localStorage.setItem('admin_user', JSON.stringify(response.data.user))
      return response.data.user
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(authQueryKey, userData)
      router.replace('/dashboard')
    },
  })

  useEffect(() => {
    if (!authLoading && user) router.replace('/dashboard')
  }, [authLoading, user, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    await loginMutation.mutateAsync({ email: values.email, password: values.password })
  }

  const isBusy = isSubmitting || loginMutation.isPending

  return (
    <main className="relative min-h-screen w-full bg-zinc-950 flex flex-col justify-center items-center px-4 overflow-hidden">

      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-100 h-100 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        <div className="backdrop-blur-md bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-8 shadow-2xl">

          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/15 border border-purple-500/25 flex items-center justify-center text-purple-400 mb-4 shadow-lg shadow-purple-500/10">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">Admin Portal</h1>
            <p className="text-zinc-500 text-sm mt-1">Sign in to manage system operations</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

            <AnimatePresence mode="wait">
              {loginMutation.error && (
                <motion.div
                  key="server-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2.5 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{loginMutation.error.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              id="email"
              type="email"
              label="Email Address"
              placeholder="admin@example.com"
              autoComplete="email"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="••••••••"
              autoComplete="current-password"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              rightElement={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isBusy}
              className="mt-2"
            >
              {isBusy ? 'Authenticating…' : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-5">
          Restricted access — admin credentials required
        </p>
      </motion.div>
    </main>
  )
}
