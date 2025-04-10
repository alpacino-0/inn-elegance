import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"

// Sayfanın pre-render edilmemesi için export ekliyoruz
export const dynamic = "force-dynamic"

export default function RegisterPage() {
  return (
    <div className="container flex flex-col items-center justify-center w-full max-w-md px-4 py-12 mx-auto">
      <div className="w-full space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Kayıt Ol</h1>
          <p className="text-muted-foreground">
            Hesap oluşturarak villa rezervasyonlarınızı kolayca yönetin
          </p>
        </div>
        <RegisterForm />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Zaten hesabınız var mı?{" "}
            <Link
              href="/auth/login"
              className="text-primary font-medium hover:underline"
            >
              Giriş yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 