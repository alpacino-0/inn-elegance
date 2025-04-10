"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type SubmitHandler } from "react-hook-form"
import * as z from "zod"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

// Form şeması
const registerFormSchema = z
  .object({
    name: z.string().min(2, {
      message: "İsim en az 2 karakter olmalıdır.",
    }),
    email: z.string().email({
      message: "Geçerli bir e-posta adresi giriniz.",
    }),
    password: z.string().min(8, {
      message: "Şifre en az 8 karakter olmalıdır.",
    }),
    confirmPassword: z.string(),
    terms: z.boolean().refine((value) => value === true, {
      message: "Kullanım şartlarını kabul etmelisiniz.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor.",
    path: ["confirmPassword"],
  })

// Form tür tanımı
type RegisterFormValues = z.infer<typeof registerFormSchema>

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form varsayılan değerleri
  const defaultValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  }

  // Form tanımı
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues,
  })

  // Form gönderim işlemi
  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    setIsLoading(true)

    try {
      // API üzerinden kayıt işlemi
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name, 
          email: values.email, 
          password: values.password
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Kayıt işlemi başarısız")
      }
      
      // Başarılı kayıt sonrası giriş sayfasına yönlendirme
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("Kayıt hatası:", error)
      
      // Hata mesajını kontrol et
      if (error instanceof Error) {
        if (error.message.includes("E-posta adresi zaten kullanımda")) {
          form.setError("email", {
            message: "Bu e-posta adresi zaten kullanılıyor.",
          })
        } else {
          form.setError("root", {
            message: error.message || "Kayıt işlemi başarısız. Lütfen tekrar deneyin.",
          })
        }
      } else {
        form.setError("root", {
          message: "Kayıt işlemi başarısız. Lütfen tekrar deneyin.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad Soyad</FormLabel>
              <FormControl>
                <Input
                  placeholder="Adınız ve soyadınız"
                  autoComplete="name"
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
                    autoComplete="new-password"
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
              <FormDescription>
                En az 8 karakter olmalıdır.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Şifre Tekrar</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="pr-10"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  <span>
                    <span className="mr-1">Kullanım şartlarını ve</span>
                    <Button
                      variant="link"
                      className="h-auto p-0 font-normal"
                      onClick={(e) => e.preventDefault()}
                    >
                      gizlilik politikasını
                    </Button>
                    <span className="ml-1">kabul ediyorum.</span>
                  </span>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <p className="text-destructive text-sm text-center">
            {form.formState.errors.root.message}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
        </Button>
      </form>
    </Form>
  )
} 