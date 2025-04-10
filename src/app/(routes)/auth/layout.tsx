import Link from "next/link"
import Image from "next/image"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="grid lg:grid-cols-2 min-h-screen">
      {/* Sol taraf - Form alanı */}
      <div className="flex items-center justify-center p-4 md:p-8">
        {/* Logo alanı */}
        <div className="absolute top-8 left-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-medium">
            <Image
              src="/logo.svg"
              alt="Villa Rezervasyon Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
        </div>
        
        {/* Form içeriği */}
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </div>
      
      {/* Sağ taraf - Görsel alanı (sadece büyük ekranlarda) */}
      <div className="hidden lg:block relative bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 z-10" />
        <Image
          src="/assets/images/auth-bg.jpg"
          alt="Villa Görüntüsü"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 flex flex-col items-start justify-end h-full p-8 text-white">
          <blockquote className="space-y-2 mb-6">
            <p className="text-lg">
              &ldquo;Tatil hayallerinizi gerçeğe dönüştürüyoruz. En lüks ve konforlu villalarımızda unutulmaz bir tatil deneyimi için hemen rezervasyon yapın.&rdquo;
            </p>
            <footer className="text-sm font-medium">Villa Rezervasyon Ekibi</footer>
          </blockquote>
        </div>
      </div>
    </div>
  )
} 