import { resetPasswordAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import type { Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function ResetPassword(props: {
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
          <CardTitle className="text-2xl font-bold text-center font-montserrat">Yeni Şifre Oluştur</CardTitle>
          <CardDescription className="text-center font-nunito">
            Lütfen yeni şifrenizi aşağıya girin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="flex flex-col space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="font-nunito font-medium">Yeni şifre</Label>
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
              <p className="text-xs text-muted-foreground font-nunito">
                Şifreniz en az 6 karakter uzunluğunda olmalıdır
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-nunito font-medium">Şifreyi onaylayın</Label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={6}
                required
                className="w-full"
              />
            </div>
            <SubmitButton 
              formAction={resetPasswordAction} 
              pendingText="Şifre Değiştiriliyor..."
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium font-nunito mt-2"
            >
              Şifremi Güncelle
            </SubmitButton>
            <FormMessage message={searchParams} />
          </form>
        </CardContent>
        <CardFooter className="flex flex-col border-t">
          <p className="text-sm text-muted-foreground font-nunito">
            İşleminiz tamamlandıktan sonra{" "}
            <Link className="text-primary font-medium hover:underline" href="/sign-in">
              Giriş Yap
            </Link>
            {" "}sayfasına yönlendirileceksiniz.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
