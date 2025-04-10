import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Korumalı rotalar
const protectedRoutes = ["/dashboard", "/profile"]
// Public rotalar (login/register gibi, giriş yapmış kullanıcıların erişim kontrolü için)
const authRoutes = ["/auth/login", "/auth/register"]

export default withAuth(
  function middleware(req) {
    // Mevcut URL yolu
    const path = req.nextUrl.pathname
    
    // NextAuth tarafından eklenen session tokeni ve oturum durumu
    const isAuthenticated = !!req.nextauth.token

    // Giriş yapmış kullanıcı auth sayfalarına erişmeye çalışıyor
    if (authRoutes.some(route => path === route) && isAuthenticated) {
      // Kullanıcı zaten giriş yapmış, anasayfaya yönlendir
      return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Auth istemeyen sayfalarda middleware'i çalıştırma
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Korumalı rotalar için token kontrolü
        if (protectedRoutes.some(route => path.startsWith(route))) {
          return !!token // Token varsa true, yoksa false
        }
        
        // Diğer sayfalar her durumda erişilebilir
        return true
      },
    },
  }
)

// Middleware çalışacak rotaları yapılandır
export const config = {
  matcher: [
    /*
     * Korumalı rotalar:
     * - Dashboard ve alt sayfaları
     * - Profil ve alt sayfaları
     * Auth rotaları:
     * - Giriş ve kayıt sayfaları
     */
    "/dashboard/:path*",
    "/profile/:path*",
    "/auth/login",
    "/auth/register",
  ],
} 