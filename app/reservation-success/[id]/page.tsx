'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Check, Clock, Home, Mail, MapPin, Phone, User, Shield } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import Image from 'next/image';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Reservation } from '@/types/reservation';
import type { Villa } from '@/types/villa';
import type { VillaImage } from '@/types/villa-image';
import { ReservationService } from '@/lib/services/reservation-service';
import { VillaService } from '@/lib/services/villa-service';

// Villa servisinden dönen genişletilmiş villa türünü temsil eden arayüz
interface ExtendedVilla extends Villa {
  featuredImage?: string;
  images?: VillaImage[];
  locationName?: string;
  locationDistrict?: string;
  locationCity?: string;
}

export default function ReservationSuccessPage() {
  // useParams hook'u ile client tarafında route parametrelerini alıyoruz
  const params = useParams();
  const reservationId = params.id as string;
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingRef = searchParams.get('ref');
  const emailVerification = searchParams.get('verify') === 'true';
  
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [villa, setVilla] = useState<ExtendedVilla | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Rezervasyon detaylarını getir
  useEffect(() => {
    const fetchReservation = async () => {
      if (!bookingRef) {
        setError('Rezervasyon referansı bulunamadı');
        setLoading(false);
        return;
      }

      try {
        const data = await ReservationService.getReservationByRef(bookingRef);
        
        if (!data) {
          setError('Rezervasyon bilgileri bulunamadı');
        } else if (reservationId !== data.id) {
          // Eğer URL'deki ID ile rezervasyon ID'si eşleşmiyorsa
          setError('Geçersiz rezervasyon bilgileri');
        } else {
          setReservation(data);
          
          // Rezervasyona ait villa bilgilerini getir
          try {
            const villaData = await VillaService.getVillaById(data.villaId);
            if (villaData) {
              setVilla(villaData as ExtendedVilla);
            }
          } catch (villaErr) {
            console.error('Villa bilgileri yüklenirken hata:', villaErr);
            // Villa bilgileri yüklenemese bile rezervasyon bilgilerini göstermeye devam ediyoruz
          }
        }
      } catch (err) {
        console.error('Rezervasyon yükleme hatası:', err);
        setError('Rezervasyon bilgileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [bookingRef, reservationId]);

  // Tarih formatını düzenle
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };
  
  // Yükleme durumunda gösterilecek içerik
  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl md:text-2xl">
              Rezervasyon Bilgileri Yükleniyor...
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Hata durumunda gösterilecek içerik
  if (error || !reservation) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl md:text-2xl text-destructive">
              Rezervasyon Bilgileri Bulunamadı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                {error || 'Rezervasyon bilgileri bulunamadı. Lütfen geçerli bir rezervasyon referansı kullanın.'}
              </AlertDescription>
            </Alert>
            <div className="text-center">
              <Button onClick={() => router.push('/reservation-success')} className="mt-4">
                Rezervasyon Sorgulama
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Toplam gün sayısını hesapla
  const calculateDays = () => {
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <Card className="shadow-lg">
        <CardHeader className="bg-primary/5 pb-6">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center text-xl md:text-2xl">
            {emailVerification ? 'E-posta Doğrulandı!' : 'Rezervasyon Detayları'}
          </CardTitle>
          <CardDescription className="text-center text-base">
            Rezervasyon kodunuz: <span className="font-semibold">{reservation.bookingRef}</span>
            {emailVerification && (
              <div className="flex items-center justify-center mt-2 text-sm font-medium text-green-600">
                <Shield className="h-4 w-4 mr-1" />
                E-posta doğrulaması başarılı
              </div>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          {/* Villa Bilgileri Bölümü */}
          {villa && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Villa Bilgileri</h3>
              
              <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/20 rounded-lg overflow-hidden">
                {villa.featuredImage && (
                  <div className="sm:w-1/3 h-24 sm:h-auto overflow-hidden rounded-md relative">
                    <Image 
                      src={villa.featuredImage} 
                      alt={villa.title} 
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                )}
                
                <div className="sm:w-2/3 space-y-2">
                  <h4 className="text-base font-medium">{villa.title}</h4>
                  
                  <div className="flex items-start space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      {villa.locationDistrict || villa.subRegion}, {villa.locationCity || villa.mainRegion}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{villa.bedrooms} Yatak Odası</span>
                    </div>
                    
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>Maks. {villa.maxGuests} Misafir</span>
                    </div>
                  </div>
                  
                  <div className="pt-1">
                    <Link 
                      href={`/villa-kiralama/${villa.slug}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Villa detaylarını görüntüle
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rezervasyon Detayları</h3>
              
              <div className="space-y-2">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Giriş Tarihi</p>
                    <p className="text-muted-foreground">{formatDate(reservation.startDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Çıkış Tarihi</p>
                    <p className="text-muted-foreground">{formatDate(reservation.endDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Konaklama Süresi</p>
                    <p className="text-muted-foreground">{calculateDays()} gece</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <User className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Misafir Sayısı</p>
                    <p className="text-muted-foreground">{reservation.guestCount} kişi</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">İletişim Bilgileri</h3>
              
              <div className="space-y-2">
                <div className="flex items-start">
                  <User className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Ad Soyad</p>
                    <p className="text-muted-foreground">{reservation.customerName}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">E-posta</p>
                    <p className="text-muted-foreground">{reservation.customerEmail}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Telefon</p>
                    <p className="text-muted-foreground">{reservation.customerPhone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ödeme Bilgileri</h3>
            
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span>Toplam Tutar</span>
                <span className="font-medium">{reservation.totalAmount.toLocaleString('tr-TR')} ₺</span>
              </div>
              
              {reservation.paymentType === 'SPLIT_PAYMENT' && (
                <>
                  <div className="flex justify-between">
                    <span>Ön Ödeme</span>
                    <span className="font-medium">{reservation.advanceAmount.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Kalan Ödeme</span>
                    <span className="font-medium">{reservation.remainingAmount.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  
                  <Separator />
                </>
              )}
              
              <div className="flex justify-between text-lg font-semibold">
                <span>{reservation.paymentType === 'SPLIT_PAYMENT' ? 'Şu An Ödenecek Tutar' : 'Toplam Ödenecek Tutar'}</span>
                <span className="text-primary">
                  {reservation.paymentType === 'SPLIT_PAYMENT' 
                    ? reservation.advanceAmount.toLocaleString('tr-TR') 
                    : reservation.totalAmount.toLocaleString('tr-TR')
                  } ₺
                </span>
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium">Ödeme Yöntemi:</span> 
              <span className="text-sm ml-2">
                {reservation.paymentMethod === 'BANK_TRANSFER' 
                  ? 'Banka Havalesi/EFT' 
                  : reservation.paymentMethod === 'CREDIT_CARD' 
                  ? 'Kredi Kartı' 
                  : reservation.paymentMethod
                }
              </span>
            </div>
          </div>
          
          <Alert className="bg-amber-50 border-amber-200">
            <AlertDescription>
              <p>Rezervasyon detaylarını içeren bir e-posta <span className="font-semibold">{reservation.customerEmail}</span> adresine gönderilmiştir.</p>
              <p className="mt-1">Rezervasyonunuzla ilgili sorularınız için bizimle iletişime geçebilirsiniz.</p>
            </AlertDescription>
          </Alert>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 pb-6">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/">
              Ana Sayfaya Dön
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/contact">
              Bizimle İletişime Geçin
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 