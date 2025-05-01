'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PhoneCall, Mail, Loader2, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface VillaSupportProps {
  villaId: string;
  villaTitle: string;
}

export default function VillaSupport({ villaId, villaTitle }: VillaSupportProps) {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basit validasyon
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Lütfen tüm zorunlu alanları doldurunuz.');
      return;
    }
    
    // Demo formun gönderildiğini simüle et - villaId'yi kullan
    console.log(`Villa ID: ${villaId} için destek talebi oluşturuldu`);
    setIsLoading(true);
    setError(null);
    
    // Gönderim simülasyonu için 1 saniye beklet
    setTimeout(() => {
      // Form alanlarını temizle ve başarı durumunu göster
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setIsSent(true);
      setIsLoading(false);
      
      // 5 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setIsSent(false);
      }, 5000);
    }, 1000);
  };
  
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden mt-4">
      <CardHeader className="bg-primary/5 p-4">
        <CardTitle className="text-lg flex items-center">
          <HelpCircle className="w-5 h-5 mr-2 text-primary" />
          Yardıma mı ihtiyacınız var?
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">{villaTitle}</strong> isimli villa hakkında detaylı bilgi almak istiyorsanız lütfen aşağıdaki telefon numaralarımızdan bize ulaşınız veya aranma talep formunu doldurunuz.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-muted/30 p-3 rounded-md">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground mb-1">Müşteri Desteği:</p>
            <div className="flex items-center">
              <PhoneCall className="h-4 w-4 mr-2 text-primary" />
              <a href="tel:+902428441012" className="text-sm hover:underline">+90 242 844 10 12</a>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-foreground mb-1">E-posta:</p>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-primary" />
              <a href="mailto:info@villarezervasyon.com" className="text-sm hover:underline">info@villarezervasyon.com</a>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-2 text-xs text-muted-foreground">
              veya
            </span>
          </div>
        </div>
        
        <div>
          <p className="text-sm mb-3">Yetkili personelimiz tarafından aranmak istiyorsanız lütfen formu doldurun:</p>
          
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-3">
              {error}
            </div>
          )}
          
          {isSent && (
            <div className="bg-green-100 text-green-800 p-3 rounded-md text-sm mb-3">
              Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Input
                type="text"
                placeholder="Adınız Soyadınız *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div>
              <Input
                type="email"
                placeholder="E-posta Adresiniz *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div>
              <Input
                type="tel"
                placeholder="Telefon Numaranız"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Textarea
                placeholder="Mesajınız *"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
                rows={3}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                'Aranma Talebi Gönder'
              )}
            </Button>
          </form>
        </div>
      </CardContent>
      
      <CardFooter className="p-0">
        <Link 
          href="/contact"
          className="w-full bg-muted/30 hover:bg-primary/10 transition-colors p-3 text-sm flex items-center justify-center"
        >
          Tüm İletişim Bilgileri
          <ArrowRight className="h-4 w-4 ml-2" />
        </Link>
      </CardFooter>
    </Card>
  );
} 