"use client"

import { useSession, signIn, signOut } from "next-auth/react"

/**
 * Kullanıcı oturumunu kontrol etmek için hook
 */
export function useAuth() {
  const { data: session, status } = useSession()
  
  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated"
  const user = session?.user
  
  /**
   * Giriş yapmak için fonksiyon
   */
  const login = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      
      return { success: !result?.error, error: result?.error }
    } catch (err) {
      console.error("Giriş hatası:", err)
      return { success: false, error: "Giriş sırasında bir hata oluştu." }
    }
  }
  
  /**
   * Çıkış yapmak için fonksiyon
   */
  const logout = async () => {
    await signOut({ redirect: false })
  }
  
  /**
   * Kullanıcının belirli bir role sahip olup olmadığını kontrol eder
   */
  const hasRole = (role: string) => {
    return user?.role === role
  }
  
  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    hasRole,
  }
} 