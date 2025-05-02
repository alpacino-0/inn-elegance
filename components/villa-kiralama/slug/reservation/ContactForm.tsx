'use client';

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, ExternalLink } from "lucide-react";

// Validation şeması 
const formSchema = z.object({
  fullName: z.string().min(3, "Ad soyad en az 3 karakter olmalıdır"),
  email: z.string().email("Geçerli bir email adresi girin"),
  phone: z.string().min(10, "Geçerli bir telefon numarası girin"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Kiralama sözleşmesini kabul etmelisiniz",
  }),
  acceptPrivacy: z.boolean().refine(val => val === true, {
    message: "KVKK aydınlatma metnini kabul etmelisiniz",
  }),
});

// Form değer tipi
type ContactFormData = z.infer<typeof formSchema>;

interface ContactFormProps {
  onSubmit: (values: ContactFormData) => void;
  className?: string;
}

export default function ContactForm({ onSubmit, className }: ContactFormProps) {
  // Form tanımlama
  const form = useForm<ContactFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  // Form değişikliklerini izle ve geçerli olduğunda otomatik olarak submit et
  useEffect(() => {
    const subscription = form.watch(() => {
      // Tüm alanlar doldurulduysa ve form geçerliyse
      if (form.formState.isValid && !form.formState.isSubmitting) {
        // Formu otomatik olarak gönder
        const formData = form.getValues();
        if (formData.fullName && formData.email && formData.phone && 
            formData.acceptTerms && formData.acceptPrivacy) {
          onSubmit(formData);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, onSubmit]);

  // Form gönderimi
  const handleSubmit = (values: ContactFormData) => {
    onSubmit(values);
  };

  return (
    <div className={className}>
      <div className="mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold">İletişim Bilgileriniz</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Rezervasyon onayı ve önemli bilgilendirmeler için lütfen iletişim bilgilerinizi eksiksiz doldurun</p>
      </div>
      
      <Form {...form}>
        <form onChange={() => form.trigger()} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 sm:space-y-4">
          {/* Ad Soyad */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ad Soyad</FormLabel>
                <FormControl>
                  <Input placeholder="Ad ve soyadınızı giriniz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* E-posta Adresi */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-posta Adresi</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="ornek@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Telefon Numarası */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon Numarası</FormLabel>
                <FormControl>
                  <div className="space-y-1">
                    <Input 
                      type="tel" 
                      placeholder="+90 555 123 4567" 
                      {...field}
                    />
                    <p className="text-xs text-muted-foreground">
                      Lütfen ülke kodunu (+90 gibi) belirterek telefon numaranızı giriniz
                    </p>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Kiralama Sözleşmesi Onayı */}
          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-2 sm:space-x-3 space-y-0 py-1 sm:py-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                </FormControl>
                <div className="space-y-0.5 sm:space-y-1 leading-tight sm:leading-normal">
                  <FormLabel className="text-xs sm:text-sm font-normal flex items-center flex-wrap">
                    <span className="mr-1">
                      <Link href="/villa-kiralama-sozlesmesi" target="_blank" className="text-primary hover:underline inline-flex items-center">
                        Kiralama Sözleşmesini
                        <ExternalLink className="h-3 w-3 ml-0.5 inline" />
                      </Link> okudum, kabul ediyorum
                    </span>
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground cursor-help flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="max-w-[250px] sm:max-w-xs p-3 sm:p-4 text-xs sm:text-sm bg-white shadow-md rounded-lg border-none">
                          <div className="flex flex-col space-y-1 sm:space-y-2">
                            <h4 className="font-semibold text-primary">Kiralama Sözleşmesi</h4>
                            <p className="text-xs text-black">
                              Kiralama sözleşmesini incelemek için linke tıklayabilirsiniz. Sözleşmeyi kabul etmeden rezervasyon yapılamaz.
                            </p>
                            <Link 
                              href="/villa-kiralama-sozlesmesi" 
                              target="_blank"
                              className="text-[10px] sm:text-xs bg-primary/10 hover:bg-primary/20 text-primary py-1 px-2 rounded inline-flex items-center w-fit transition-colors mt-1"
                            >
                              Sözleşmeyi İncele
                              <ExternalLink className="h-2.5 w-2.5 ml-1" />
                            </Link>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                </div>
                <FormMessage className="text-[10px] sm:text-xs" />
              </FormItem>
            )}
          />
          
          {/* KVKK Metni Onayı */}
          <FormField
            control={form.control}
            name="acceptPrivacy"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-2 sm:space-x-3 space-y-0 py-1 sm:py-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                </FormControl>
                <div className="space-y-0.5 sm:space-y-1 leading-tight sm:leading-normal">
                  <FormLabel className="text-xs sm:text-sm font-normal flex items-center flex-wrap">
                    <span className="mr-1">
                      <Link href="/kisisel-verilerin-korunmasi-hakkinda-aydinlatma-metni" target="_blank" className="text-primary hover:underline inline-flex items-center">
                        KVKK Aydınlatma Metnini
                        <ExternalLink className="h-3 w-3 ml-0.5 inline" />
                      </Link> okudum, kabul ediyorum
                    </span>
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground cursor-help flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="max-w-[250px] sm:max-w-xs p-3 sm:p-4 text-xs sm:text-sm bg-white shadow-md rounded-lg border-none">
                          <div className="flex flex-col space-y-1 sm:space-y-2">
                            <h4 className="font-semibold text-primary">KVKK Aydınlatma Metni</h4>
                            <p className="text-xs text-black">
                              Kişisel verilerinizin nasıl işlendiği ve korunduğuna dair bilgilendirmeyi incelemek için linke tıklayabilirsiniz.
                            </p>
                            <Link 
                              href="/kisisel-verilerin-korunmasi-hakkinda-aydinlatma-metni" 
                              target="_blank"
                              className="text-[10px] sm:text-xs bg-primary/10 hover:bg-primary/20 text-primary py-1 px-2 rounded inline-flex items-center w-fit transition-colors mt-1"
                            >
                              Aydınlatma Metnini İncele
                              <ExternalLink className="h-2.5 w-2.5 ml-1" />
                            </Link>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                </div>
                <FormMessage className="text-[10px] sm:text-xs" />
              </FormItem>
            )}
          />
          
          {/* İptal Politikası Bilgilendirmesi */}
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-primary/5 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="font-medium">Ödeme ve İptal Bilgisi:</span> Rezervasyon iptallerinde ön ödemeler iade edilmez. Detaylı bilgi için 
                <Link href="/iptal-politikasi" target="_blank" className="text-primary hover:underline inline-flex items-center ml-1">
                  iptal politikamızı
                  <ExternalLink className="h-2.5 w-2.5 ml-0.5 inline" />
                </Link> inceleyebilirsiniz.
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
} 