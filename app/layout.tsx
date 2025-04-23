import { Nunito, Montserrat } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { createClient } from '@/utils/supabase/server';
import type { Metadata } from 'next';
import { Providers } from "./providers";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Inn Elegance - Lüks Villa Kiralama",
  description: "Türkiye'nin en güzel bölgelerinde lüks ve özel villa kiralama hizmetleri sunan Inn Elegance",
};

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
  weight: ["300", "400", "500", "600"]
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["600", "700"]
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Ekstra kullanıcı bilgilerini alma
  let userProfile = null;
  if (user) {
    const { data } = await supabase
      .from('User')
      .select('*')
      .eq('id', user.id)
      .single();
    userProfile = data;
    
    // Son giriş zamanını güncelle
    if (userProfile) {
      await supabase
        .from('User')
        .update({ lastLogin: new Date().toISOString() })
        .eq('id', user.id);
    }
  }

  return (
    <html lang="tr" className={`${nunito.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <Providers>
          <Header user={user} userProfile={userProfile} />
           <main className="flex-grow">
             {children}
           </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
