'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReservationService } from '@/lib/services/reservation-service';
import { Search, Key, Mail } from 'lucide-react';

export default function ReservationSearchPage() {
  const router = useRouter();
  const [bookingRef, setBookingRef] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form doğrulama
  const validateForm = () => {
    if (!bookingRef.trim()) {
      setError('Lütfen rezervasyon kodunuzu girin');
      return false;
    }
    
    if (!email.trim()) {
      setError('Lütfen e-posta adresinizi girin');
      return false;
    }
    
    // Basit e-posta doğrulama
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Lütfen geçerli bir e-posta adresi girin');
      return false;
    }
    
    return true;
  };
  
  // Rezervasyon arama
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Yeni doğrulama metodu kullanılıyor
      const reservation = await ReservationService.verifyReservationByEmail(bookingRef, email);
      
      if (!reservation) {
        setError('Rezervasyon bulunamadı veya e-posta adresi eşleşmiyor');
        return;
      }
      
      // Rezervasyon bulundu ve kimlik doğrulama başarılı, detay sayfasına yönlendir
      router.push(`/reservation-success/${reservation.id}?ref=${bookingRef}&verify=true`);
      
    } catch (err) {
      console.error('Rezervasyon arama hatası:', err);
      setError('Rezervasyon bilgileri yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card className="shadow-lg">
        <CardHeader className="bg-primary/5 pb-6">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center text-xl md:text-2xl">
            Rezervasyon Sorgulama
          </CardTitle>
          <CardDescription className="text-center text-base">
            Rezervasyon detaylarınızı görüntülemek için rezervasyon kodunuzu ve e-posta adresinizi girin
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSearch}>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bookingRef">
                  <span className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Rezervasyon Kodu
                  </span>
                </Label>
                <Input
                  id="bookingRef"
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  placeholder="Örn: VL-1234"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Rezervasyon kodunuz e-posta ile gönderilmiştir (Örn: VL-1234)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    E-posta Adresi
                  </span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Rezervasyon sırasında kullandığınız e-posta"
                />
                <p className="text-xs text-muted-foreground">
                  Rezervasyonu yaparken kullandığınız e-posta adresini girin
                </p>
              </div>
              
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Aranıyor...
                  </>
                ) : (
                  'Rezervasyonu Görüntüle'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col pt-2 pb-6">
          <p className="text-sm text-center text-muted-foreground mb-4">
            Rezervasyon kodunuzu bulamıyor musunuz? Lütfen e-posta kutunuzu kontrol edin veya bizimle iletişime geçin.
          </p>
          
          <Button variant="outline" asChild className="w-full">
            <a href="/contact">Yardım İçin İletişime Geçin</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 