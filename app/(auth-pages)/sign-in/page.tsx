import { signInAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import type { Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Login(props: { searchParams: Promise<Message> }) {
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
          <CardTitle className="text-2xl font-bold text-center font-montserrat">Giriş Yap</CardTitle>
          <CardDescription className="text-center font-nunito">
            Hesabınıza erişmek için bilgilerinizi girin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="flex flex-col space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-nunito font-medium">E-posta</Label>
              <Input 
                id="email"
                name="email" 
                type="email"
                placeholder="email@example.com" 
                autoComplete="email"
                required 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="font-nunito font-medium">Şifre</Label>
                <Link
                  className="text-xs text-muted-foreground hover:text-foreground underline font-nunito"
                  href="/forgot-password"
                >
                  Şifremi Unuttum?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full"
              />
            </div>
            <SubmitButton 
              formAction={signInAction} 
              pendingText="Giriş Yapılıyor..."
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium font-nunito mt-2"
            >
              Giriş Yap
            </SubmitButton>
            <FormMessage message={searchParams} />
          </form>
        </CardContent>
        <CardFooter className="flex flex-col border-t">
          <p className="text-sm text-muted-foreground font-nunito">
            Hesabınız yok mu?{" "}
            <Link className="text-primary font-medium hover:underline" href="/sign-up">
              Kayıt Ol
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
