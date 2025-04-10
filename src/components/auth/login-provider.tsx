"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LoginProviderProps {
  provider: string
  icon?: React.ReactNode
  variant?: "default" | "outline" | "secondary" | "ghost"
  className?: string
  text?: string
}

/**
 * Farklı kimlik sağlayıcıları için düğme bileşeni 
 * NextAuth provider'larını kolay kullanım için
 */
export function LoginProvider({
  provider,
  icon,
  variant = "outline",
  className,
  text = "",
}: LoginProviderProps) {
  const defaultTexts: Record<string, string> = {
    google: "Google ile giriş yap",
    facebook: "Facebook ile giriş yap",
    github: "GitHub ile giriş yap",
    twitter: "Twitter ile giriş yap",
    credentials: "E-posta ile giriş yap",
  }

  const providerText = text || defaultTexts[provider] || `${provider} ile giriş yap`

  return (
    <Button
      className={cn("w-full justify-center", className)}
      variant={variant}
      onClick={() => signIn(provider, { callbackUrl: "/" })}
    >
      {icon}
      {providerText}
    </Button>
  )
} 