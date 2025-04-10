import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"

// Sayfanın pre-render edilmemesi için export ekliyoruz
export const dynamic = "force-dynamic"

export default function LoginPage() {
  return (
    <div className="container flex flex-col items-center justify-center w-full max-w-md px-4 py-12 mx-auto">
      <div className="w-full space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Giriş Yap</h1>
          <p className="text-muted-foreground">
            Rezervasyonlarınızı yönetmek için giriş yapın
          </p>
        </div>
        <LoginForm />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Hesabınız yok mu?{" "}
            <Link
              href="/auth/register"
              className="text-primary font-medium hover:underline"
            >
              Hemen üye olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 