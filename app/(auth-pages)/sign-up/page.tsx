import { signUpAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import type { Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Hesap Oluştur</CardTitle>
          <CardDescription className="text-center">
            Hesabınızı oluşturmak için bilgilerinizi girin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="flex flex-col space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta Adresi</Label>
              <Input 
                id="email"
                name="email" 
                type="email"
                placeholder="ornek@email.com" 
                autoComplete="email"
                required 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={6}
                required
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Şifreniz en az 6 karakter uzunluğunda olmalıdır
              </p>
            </div>
            <SubmitButton 
              formAction={signUpAction} 
              pendingText="Kayıt Yapılıyor..."
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
            >
              Kayıt Ol
            </SubmitButton>
            <FormMessage message={searchParams} />
          </form>
        </CardContent>
        <CardFooter className="flex flex-col border-t">
          <p className="text-sm text-muted-foreground">
            Zaten bir hesabınız var mı?{" "}
            <Link className="text-primary font-medium hover:underline" href="/sign-in">
              Giriş Yap
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
