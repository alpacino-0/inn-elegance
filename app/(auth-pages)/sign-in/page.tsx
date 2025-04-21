import { signInAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import type { Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex-1 flex flex-col min-w-64">
      <h1 className="font-montserrat font-bold text-heading-1">Giriş Yap</h1>
      <p className="font-nunito font-regular text-body">
        Hesabınız yok mu?{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          Kayıt Ol
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email" className="font-nunito font-medium">E-posta</Label>
        <Input name="email" placeholder="email@example.com" required />
        <div className="flex justify-between items-center">
          <Label htmlFor="password" className="font-nunito font-medium">Şifre</Label>
          <Link
            className="text-xs text-foreground underline font-nunito font-light"
            href="/forgot-password"
          >
            Şifremi Unuttum?
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Şifreniz"
          required
        />
        <SubmitButton pendingText="Giriş Yapılıyor..." formAction={signInAction} className="font-nunito font-medium">
          Giriş Yap
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
