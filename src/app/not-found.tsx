// Not found sayfasının prerender edilmemesi için
export const dynamic = "force-dynamic"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center w-full min-h-screen px-4 py-12 mx-auto">
      <div className="w-full max-w-md space-y-8 text-center">
        <h2 className="text-2xl font-bold">Sayfa Bulunamadı</h2>
        <p className="text-muted-foreground">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Button asChild>
          <Link href="/">
            Ana Sayfaya Dön
          </Link>
        </Button>
      </div>
    </div>
  )
} 