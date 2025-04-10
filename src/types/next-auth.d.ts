import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * NextAuth oturumuna ek kullanıcı özelliklerini ekler
   */
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  /**
   * JWT'ye ek kullanıcı özelliklerini ekler
   */
  interface JWT {
    id: string
    role: string
  }

  /**
   * Kullanıcı nesnesine role özelliğini ekler
   */
  interface User {
    role?: string
  }
} 