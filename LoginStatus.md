# Inn Elegance - Oturum Durumu (Login Status) Kılavuzu

## İçindekiler

1. Genel Bakış
2. Supabase Kimlik Doğrulama Altyapısı
3. Header Bileşeninde Oturum Durumu Ekleme
4. Kullanıcı Kimlik Doğrulama İşlemleri
5. Oturum Durumu İle Çalışma
6. En İyi Uygulamalar ve İpuçları

## 1. Genel Bakış

Bu döküman, Inn Elegance projesindeki Header bileşenine oturum durumu entegrasyonu için bir kılavuzdur. Projede Supabase kimlik doğrulama sistemi kullanılmakta olup, Next.js Server Side Rendering (SSR) özellikleriyle entegre edilmiştir.

## 2. Supabase Kimlik Doğrulama Altyapısı

### 2.1 Supabase Yapılandırması

Projede üç temel Supabase istemcisi kullanılmaktadır:

1. **İstemci Tarafı İstemci** (`utils/supabase/client.ts`):
   - Tarayıcı ortamında çalışır
   - Kullanıcı oturumu ile ilişkili istemci tarafı işlemleri için kullanılır

2. **Sunucu Tarafı İstemci** (`utils/supabase/server.ts`):
   - Server Component'lerde ve Server Action'larda kullanılır
   - Güvenli sunucu tarafı istekleri için kullanılır

3. **Middleware İstemcisi** (`utils/supabase/middleware.ts`):
   - Middleware'de oturum durumunu kontrol eder
   - Rota koruması ve yönlendirme için kullanılır

### 2.2 Kimlik Doğrulama Akışı

Supabase kimlik doğrulama akışı şu şekilde çalışır:

1. Kullanıcı `/sign-in` veya `/sign-up` sayfasında form doldurur
2. Server Action aracılığıyla kimlik doğrulama isteği Supabase'e gönderilir
3. Başarılı giriş sonrası Supabase güvenli çerezler oluşturur
4. Middleware ve Server Component'lerde oturum durumu kontrol edilir
5. Başarılı giriş sonrası kullanıcı korumalı sayfalara yönlendirilir

## 3. Header Bileşeninde Oturum Durumu Ekleme

### 3.1 Mevcut Layout'tan Kullanıcı Bilgisi Alma

Kullanıcı bilgisini root layout'ta alıp Header bileşenine aktarmanız gerekir:

```typescript
// app/layout.tsx
import { createClient } from '@/utils/supabase/server';
import Header from '@/components/layout/Header';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="tr">
      <body>
        <Header user={user} />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

### 3.2 Header Bileşeninde Kullanıcı Tipini Tanımlama

Header bileşenini güncelleyerek kullanıcı nesnesini kabul edecek şekilde ayarlayın:

```typescript
// components/layout/Header.tsx
import { User } from '@supabase/supabase-js';

interface HeaderProps {
  user: User | null;
}

const Header = ({ user }: HeaderProps) => {
  // Mevcut Header kodu...
  
  // Oturum durumuna göre UI gösterme
  return (
    <header>
      {/* ... */}
      {user ? (
        <div>Hoş geldiniz, {user.email}</div>
      ) : (
        <div>
          <Link href="/sign-in">Giriş Yap</Link>
          <Link href="/sign-up">Kaydol</Link>
        </div>
      )}
    </header>
  );
};
```

## 4. Kullanıcı Kimlik Doğrulama İşlemleri

Projede `app/actions.ts` içinde tanımlanmış server action'lar kullanılmaktadır:

### 4.1 Kullanıcı Kaydı

Yeni kullanıcı kaydı için:

```typescript
// Server component içinde form örneği
<form action={signUpAction}>
  <input name="email" type="email" required />
  <input name="password" type="password" required />
  <button type="submit">Kaydol</button>
</form>
```

### 4.2 Kullanıcı Girişi

Kullanıcı girişi için:

```typescript
// Server component içinde form örneği
<form action={signInAction}>
  <input name="email" type="email" required />
  <input name="password" type="password" required />
  <button type="submit">Giriş Yap</button>
</form>
```

### 4.3 Şifre Sıfırlama

Şifre sıfırlama isteği için:

```typescript
// Server component içinde form örneği
<form action={forgotPasswordAction}>
  <input name="email" type="email" required />
  <button type="submit">Şifremi Sıfırla</button>
</form>
```

### 4.4 Oturumu Kapatma

Oturumu kapatmak için `signOutAction` kullanılır:

```typescript
// Client component içinde
import { signOutAction } from '@/app/actions';

const LogoutButton = () => {
  return (
    <form action={signOutAction}>
      <button type="submit">Çıkış Yap</button>
    </form>
  );
};
```

## 5. Oturum Durumu İle Çalışma

### 5.1 Sunucu Tarafında Oturum Durumunu Kontrol Etme

Server Component'lerde oturum durumunu kontrol etmek için:

```typescript
// app/protected/page.tsx gibi server component
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  return (
    <div>
      <h1>Korumalı Sayfa</h1>
      <p>Hoş geldiniz, {user.email}</p>
    </div>
  );
}
```

### 5.2 İstemci Tarafında Oturum Durumunu Kontrol Etme

Client Component'lerde oturum durumunu izlemek için:

```typescript
// components/ClientAuthCheck.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

export default function ClientAuthCheck() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const supabase = createClient();
    
    // Mevcut oturum durumunu al
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    
    getUser();
    
    // Oturum değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  if (loading) {
    return <div>Yükleniyor...</div>;
  }
  
  return (
    <div>
      {user ? (
        <p>Giriş yapıldı: {user.email}</p>
      ) : (
        <p>Giriş yapılmadı</p>
      )}
    </div>
  );
}
```

### 5.3 Middleware ile Rota Koruması

`middleware.ts` dosyasında tanımlandığı gibi, korumalı rotaları şöyle işleyebilirsiniz:

```typescript
// middleware.ts içinde zaten tanımlı
if (request.nextUrl.pathname.startsWith("/protected") && user.error) {
  return NextResponse.redirect(new URL("/sign-in", request.url));
}
```

Bu, `/protected` ile başlayan tüm rotaları korur ve kullanıcı giriş yapmamışsa `/sign-in` sayfasına yönlendirir.

## 6. En İyi Uygulamalar ve İpuçları

### 6.1 Güvenlik İpuçları

1. **Kullanıcı Bilgilerini Doğrulayın**: Server-side kontroller her zaman gereklidir.
   
2. **Çerez Yönetimi**: Supabase çerezleri otomatik olarak yönetir, ancak ek güvenlik için `httpOnly`, `secure` ve `sameSite` ayarlarını kontrol edin.

3. **Rate Limiting**: Brute force saldırılarına karşı koruma sağlamak için Supabase Authentication ayarlarında rate limiting'i etkinleştirin.

### 6.2 Kullanıcı Deneyimi İpuçları

1. **Hata İşleme**: Authentication işlemlerinde oluşabilecek hataları kullanıcı dostu mesajlarla gösterin.

2. **Yükleme Durumları**: Authentication işlemleri sırasında kullanıcılara yükleme göstergeleri sunun.

3. **Başarılı İşlemler İçin Geri Bildirim**: Başarılı giriş, kayıt veya şifre sıfırlama işlemleri için kullanıcılara bildirim gösterin.

### 6.3 Performans İpuçları

1. **İstemci Tarafı Önbelleğe Alma**: Gereksiz sunucu isteklerini azaltmak için kullanıcı verileri istemci tarafında önbelleğe alınabilir.

2. **Kullanıcı Verilerini Ön Yükleme**: Varsayılan layout içinde kullanıcı verilerini ön yükleme yaparak sayfa geçişlerinde daha iyi deneyim sağlayın.

3. **Auth Değişiklik Dinleyicilerini Optimize Edin**: Yalnızca gerektiğinde `onAuthStateChange` dinleyicileri kullanın ve component unmount olduğunda aboneliği iptal edin.

---

Bu döküman, Inn Elegance projesinde Supabase kimlik doğrulama sistemi ile Header bileşenine oturum durumu eklemek için temel bilgileri içermektedir. Projenizin özel ihtiyaçlarına göre uyarlayabilirsiniz. 