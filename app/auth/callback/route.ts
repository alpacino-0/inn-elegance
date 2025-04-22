import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("redirect_to") || "/protected";

  if (code) {
    const supabase = await createClient();
    
    // Kimlik doğrulama kodu ile exchange
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      // Kullanıcının User tablosunda kaydı var mı kontrol et
      const { data: existingUser } = await supabase
        .from('User')
        .select('id')
        .eq('id', data.user.id)
        .single();
      
      // Eğer kayıt yoksa (sosyal medya ile ilk giriş), kayıt oluştur
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('User')
          .insert({
            id: data.user.id,
            email: data.user.email,
            password: null,
            name: data.user.user_metadata?.full_name || null,
            avatar: data.user.user_metadata?.avatar_url || null,
            role: 'CUSTOMER',
            status: 'ACTIVE',
            emailVerified: data.user.email_confirmed_at || null,
            lastLogin: new Date().toISOString(),
            notificationPrefs: {
              email: true,
              push: false,
              marketing: false,
              unread: 0
            }
          });
          
        if (insertError) {
          console.error('Kullanıcı profili oluşturulurken hata:', insertError.message);
        }
      } else {
        // Son giriş zamanını güncelle
        await supabase
          .from('User')
          .update({ lastLogin: new Date().toISOString() })
          .eq('id', data.user.id);
      }
    }
    
    // Kullanıcı rolüne göre yönlendirme
    if (!error && data?.user) {
      const { data: userData } = await supabase
        .from('User')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (userData?.role === 'ADMIN' && next === '/protected') {
        return NextResponse.redirect(new URL('/protected/admin', request.url));
      }
    }
  }

  // Auth işlemi tamamlandıktan sonra yönlendir
  return NextResponse.redirect(new URL(next, request.url));
}
