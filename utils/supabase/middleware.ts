import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // Oturum bilgilerini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Ana sayfa yönlendirmesi kaldırıldı
    
    // Giriş/kayıt sayfaları yönlendirmesi
    if ((request.nextUrl.pathname === "/sign-in" || request.nextUrl.pathname === "/sign-up") && !userError) {
      return NextResponse.redirect(new URL("/protected", request.url));
    }
    
    // 1. Korumalı rotalar kontrolü (tüm /protected/* rotaları)
    if (request.nextUrl.pathname.startsWith("/protected")) {
      // Giriş yapmamış kullanıcılar için
      if (userError) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
      
      // Kullanıcı bilgilerini ve rolünü kontrol et
      if (user) {
        const { data: userData, error: profileError } = await supabase
          .from('User')
          .select('role, status')
          .eq('id', user.id)
          .single();
          
        // Kullanıcı profili bulunamadı veya hata oluştu
        if (profileError || !userData) {
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL("/sign-in?error=profile_not_found", request.url));
        }
        
        // Yasaklı veya inaktif kullanıcı
        if (userData.status !== 'ACTIVE') {
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL("/sign-in?error=account_inactive", request.url));
        }
        
        // 2. Admin rotaları kontrolü
        if (request.nextUrl.pathname.startsWith("/protected/admin")) {
          if (userData.role !== 'ADMIN') {
            // Admin değilse erişim engellenir
            return NextResponse.redirect(new URL("/protected?error=unauthorized", request.url));
          }
        }
      }
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    console.error("Middleware error:", e);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
