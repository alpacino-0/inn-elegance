"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth"

// Form şeması
const formSchema = z.object({
  email: z.string().email({
    message: "Geçerli bir e-posta adresi giriniz.",
  }),
  password: z.string().min(8, {
    message: "Şifre en az 8 karakter olmalıdır.",
  }),
  rememberMe: z.boolean().default(false),
})

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Form tanımı 
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  // Form gönderim işlemi
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // NextAuth üzerinden giriş yap
      const result = await login(values.email, values.password)
      
      if (result.success) {
        // Başarılı giriş sonrası anasayfaya yönlendirme
        router.push("/")
        router.refresh()
      } else {
        // Hata durumunda form hatasını göster
        form.setError("root", {
          message: result.error || "E-posta veya şifre hatalı. Lütfen tekrar deneyin.",
        })
      }
    } catch (error) {
      console.error("Giriş hatası:", error)
      // Hata durumunda form hatasını göster
      form.setError("root", {
        message: "E-posta veya şifre hatalı. Lütfen tekrar deneyin.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-posta</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="ornek@email.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Şifre</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="pr-10"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Beni hatırla
                </label>
              </div>
            )}
          />
          <Button variant="link" className="px-0 font-normal" size="sm">
            Şifremi unuttum
          </Button>
        </div>
        {form.formState.errors.root && (
          <p className="text-destructive text-sm text-center">
            {form.formState.errors.root.message}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>
    </Form>
  )
} 