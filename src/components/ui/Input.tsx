'use client'

import React, { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightElement?: React.ReactNode
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightElement,
      fullWidth = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false)
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-xs font-semibold uppercase tracking-wider transition-colors duration-200',
              focused ? 'text-purple-400' : 'text-zinc-400',
              error && 'text-red-400'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative group">
          {leftIcon && (
            <span
              className={cn(
                'absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200',
                focused ? 'text-purple-400' : 'text-zinc-500',
                error && 'text-red-400/70'
              )}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            onFocus={(e) => {
              setFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              props.onBlur?.(e)
            }}
            className={cn(
              'bg-zinc-950/80 border text-zinc-200 py-3 rounded-xl outline-none transition-all duration-200 text-sm placeholder:text-zinc-600',
              leftIcon ? 'pl-10' : 'pl-4',
              rightElement ? 'pr-11' : 'pr-4',
              error
                ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                : 'border-zinc-800 focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/20',
              fullWidth && 'w-full',
              className
            )}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>

        {/* Error or hint */}
        {error ? (
          <p className="text-xs text-red-400 flex items-center gap-1.5 pl-0.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-zinc-500 pl-0.5">{hint}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
