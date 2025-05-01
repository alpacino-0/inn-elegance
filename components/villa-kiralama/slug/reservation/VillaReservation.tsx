'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addDays } from "date-fns";
import DateRangePicker from "./DateRangePicker";
import GuestCounter from "./GuestCounter";
import { 
  PaymentType as SeasonalPaymentType,
  useSeasonalPriceCalculator 
} from "./SeasonalPriceCalculator";
import PaymentTypeSelector from "./PaymentTypeSelector";
import PaymentMethodSelector, { PaymentMethod } from "./PaymentMethodSelector";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ContactForm from "./ContactForm";
import { PaymentType } from "@/types/reservation";
import type { PaymentMethod as ReservationPaymentMethod, ReservationFormData } from "@/types/reservation";

interface VillaReservationProps {
  villaId: string;
  nightlyPrice: number; // Gecelik fiyat
  deposit?: number | null;
  cleaningFee?: number | null;
  shortStayDayLimit?: number | null;
  minimumStay?: number;
  maxGuests: number; // Villa modelinden gelen maksimum misafir sayısı, zorunlu parametre
  advancePaymentRate?: number; // Ön ödeme oranı (0.2 = %20)
}

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export default function VillaReservation({
  villaId,
  nightlyPrice,
  deposit = 0,
  cleaningFee = 0,
  shortStayDayLimit = 7,
  minimumStay = 1,
  maxGuests, // maxGuests için varsayılan değer kullanmıyoruz, zorunlu olmalı
  advancePaymentRate = 0.2
}: VillaReservationProps) {
  // Depozito
  const depositAmount = deposit || 0;
  
  // Bugünün tarihini al (takvim için)
  const today = new Date();
  
  // State tanımlamaları - Başlangıçta tarih seçili olmasın
  const [checkinDate, setCheckinDate] = useState<Date | undefined>(undefined);
  const [checkoutDate, setCheckoutDate] = useState<Date | undefined>(undefined);
  const [guestCount, setGuestCount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<SeasonalPaymentType>(SeasonalPaymentType.FULL);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER);
  const [showDetailedPrices, setShowDetailedPrices] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactFormData | null>(null);
  const [reservationError, setReservationError] = useState<string | null>(null);
  
  // Sezonsal fiyat hesaplayıcı hook'unu kullan - güncellenmiş versiyonu kullanıyoruz
  const {
    isLoading: isPriceLoading,
    priceCalculation,
    paymentCalculation,
    error: priceError
  } = useSeasonalPriceCalculator(
    villaId,
    checkinDate,
    checkoutDate,
    cleaningFee || 0,
    shortStayDayLimit || 7,
    selectedPaymentType,
    advancePaymentRate
  );
  
  // Tarih seçimlerini yönet
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    if (!checkinDate || (checkinDate && checkoutDate)) {
      // İlk tarih seçimi veya her iki tarih de seçiliyse, giriş tarihini ayarla
      setCheckinDate(date);
      setCheckoutDate(undefined);
    } else {
      // Çıkış tarihi giriş tarihinden önce olamaz
      if (date <= checkinDate) {
        setCheckoutDate(addDays(checkinDate, 1));
      } else {
        setCheckoutDate(date);
      }
    }
  };
  
  // Ödeme tipini değiştir
  const handlePaymentTypeChange = (paymentType: SeasonalPaymentType) => {
    setSelectedPaymentType(paymentType);
  };

  // Ödeme yöntemini değiştir
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  // İletişim formu gönderildiğinde
  const handleContactFormSubmit = (values: ContactFormData) => {
    console.log("İletişim Bilgileri Kaydedildi:", values);
    setContactInfo(values);
  };
  
  // Rezervasyon formunu gönder
  const handleReservation = async () => {
    // Hata durumunu sıfırla
    setReservationError(null);
    
    if (!checkinDate || !checkoutDate) {
      setReservationError('Lütfen giriş ve çıkış tarihlerini seçin.');
      return;
    }
    
    if (!priceCalculation || !paymentCalculation) {
      setReservationError('Fiyat hesaplanamadı. Lütfen daha sonra tekrar deneyin.');
      return;
    }

    // İletişim bilgilerini kontrol et
    if (!contactInfo) {
      setReservationError('Lütfen iletişim bilgilerinizi girin ve onay kutularını işaretleyin.');
      return;
    }

    // Gerekli alanların doldurulup doldurulmadığını kontrol et
    if (!contactInfo.fullName) {
      setReservationError('Lütfen ad ve soyadınızı girin.');
      return;
    }
    
    if (!contactInfo.email) {
      setReservationError('Lütfen e-posta adresinizi girin.');
      return;
    }
    
    if (!contactInfo.phone) {
      setReservationError('Lütfen telefon numaranızı girin.');
      return;
    }
    
    if (!contactInfo.acceptTerms) {
      setReservationError('Lütfen kiralama sözleşmesini kabul edin.');
      return;
    }
    
    if (!contactInfo.acceptPrivacy) {
      setReservationError('Lütfen KVKK aydınlatma metnini kabul edin.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Ödeme tipini dönüştür
      const reservationPaymentType = selectedPaymentType === SeasonalPaymentType.FULL 
        ? PaymentType.FULL_PAYMENT 
        : PaymentType.SPLIT_PAYMENT;
      
      // Tarihlerin geçerli Date nesneleri olduğundan emin ol
      const validStartDate = new Date(checkinDate);
      const validEndDate = new Date(checkoutDate);
      
      // Rezervasyon verilerini hazırla bölümünü güncelleyelim
      const reservationData: ReservationFormData = {
        villaId,
        startDate: validStartDate,
        endDate: validEndDate,
        guestCount,
        totalDays: priceCalculation.totalDays,
        totalPrice: priceCalculation.finalTotal,
        cleaningFee: priceCalculation.appliedCleaningFee,
        paymentType: reservationPaymentType,
        paymentMethod: selectedPaymentMethod as ReservationPaymentMethod,
        advancePayment: paymentCalculation.currentPayment,
        remainingAmount: paymentCalculation.remainingPayment,
        contactInfo: {
          fullName: contactInfo.fullName,
          email: contactInfo.email,
          phone: contactInfo.phone,
          acceptTerms: contactInfo.acceptTerms,
          acceptPrivacy: contactInfo.acceptPrivacy
        }
      };
      
      // Rezervasyon API isteği
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Rezervasyon işlemi sırasında bir hata oluştu.');
      }
      
      const result = await response.json();
      
      // Başarı mesajı göster
      alert(`Rezervasyon talebiniz başarıyla oluşturuldu. ${contactInfo.fullName} adına ${new Date(checkinDate).toLocaleDateString('tr-TR')} - ${new Date(checkoutDate).toLocaleDateString('tr-TR')} tarihleri için rezervasyonunuz alındı. Rezervasyon referans kodunuz: ${result.bookingRef}`);
      
      // Rezervasyon başarılı sayfasına yönlendir
      window.location.href = `/reservation-success/${result.id}?ref=${result.bookingRef}`;
      
    } catch (error) {
      console.error('Rezervasyon hatası:', error);
      setReservationError(error instanceof Error ? error.message : 'Rezervasyon işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fiyat gösterimi için yardımcı değişkenler
  const showPriceDetails = checkinDate && checkoutDate && priceCalculation;
  const totalDays = priceCalculation?.totalDays || 0;
  const showPriceLoading = (checkinDate && checkoutDate) && isPriceLoading;
  
  // Ekran boyutunu takip edecek bir hook ekleyelim
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Ekran boyutunu kontrol et
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // İlk yüklenmede kontrol et
    checkMobile();
    
    // Ekran boyutu değiştiğinde kontrol et
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Bilgilendirme için günlük fiyatları göster
  const renderDailyPrices = () => {
    if (!priceCalculation?.dailyPrices) return null;
    
    return (
      <div className="bg-muted/30 p-2 rounded-md space-y-1 text-[10px] sm:text-xs">
        <div className="w-full overflow-x-auto">
          <div className="flex gap-1 pb-2 min-w-max">
            {priceCalculation.dailyPrices.map((dayPrice) => (
              <div 
                key={dayPrice.date} 
                className={`flex flex-col items-center text-center p-1 border rounded-md min-w-[45px] sm:min-w-[55px] ${dayPrice.isSpecialOffer ? 'bg-green-50 border-green-100' : 'bg-white/70'} shadow-sm`}
              >
                <div className="capitalize font-medium text-[9px] sm:text-[10px]">{dayPrice.dayName.substring(0, 3)}</div>
                <div className="text-muted-foreground text-[8px] sm:text-[9px]">{dayPrice.formattedDate.split(' ')[0]}</div>
                <div className="mt-0.5 font-semibold text-[9px] sm:text-[10px]">{dayPrice.price?.toLocaleString('tr-TR')} ₺</div>
              </div>
            ))}
          </div>
        </div>
                
        {/* Mobil ekranlar için kaydırma ipucu */}
        <div className="text-center text-[9px] text-muted-foreground sm:hidden mt-1 flex items-center justify-center">
          <span className="inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1" aria-hidden="true" aria-label="Sola kaydır">
              <polyline points="15 18 9 12 15 6" />
            </svg> 
            Kaydırın 
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1" aria-hidden="true" aria-label="Sağa kaydır">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </div>
      </div>
    );
  };
  
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <CardContent className="p-2 sm:p-3 md:p-6 space-y-2 sm:space-y-3 md:space-y-4">
        {/* Fiyat başlığı */}
        <div className="flex flex-col space-y-0.5 sm:space-y-1">
          <div className="text-lg sm:text-xl md:text-2xl font-semibold flex flex-wrap items-baseline gap-1">
            {priceCalculation?.averagePrice 
              ? Math.round(priceCalculation.averagePrice).toLocaleString('tr-TR') 
              : nightlyPrice.toLocaleString('tr-TR')
            } ₺
            <span className="text-xs sm:text-sm md:text-base font-normal text-gray-600"> / gece</span>
          </div>
        </div>
        
        {/* Tarih Seçimi */}
        <DateRangePicker
          today={today}
          selectedStartDate={checkinDate}
          selectedEndDate={checkoutDate}
          onDateSelect={handleDateSelect}
          minStay={minimumStay}
          size={isMobile ? "lg" : "md"}
          className="w-full"
          villaId={villaId}
        />
        
        {/* Misafir Sayısı - Burada GuestCounter kullanıyoruz */}
        <div className="space-y-1">
          <GuestCounter 
            guestCount={guestCount}
            onGuestCountChange={setGuestCount}
            maxGuests={maxGuests}
            className="border rounded-md p-2 sm:p-3 md:p-4"
          />
        </div>
        
        {/* Fiyat yüklenirken gösterilen mesaj */}
        {showPriceLoading && (
          <div className="flex items-center justify-center py-2 sm:py-4">
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin text-primary" />
            <span className="text-xs sm:text-sm text-gray-600">Fiyatlar hesaplanıyor...</span>
          </div>
        )}
        
        {/* Tarih seçimi yapılmadıysa gösterilen mesaj */}
        {!checkinDate && !checkoutDate && !showPriceLoading && (
          <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-md text-xs sm:text-sm text-muted-foreground">
            Fiyat bilgisi görmek için lütfen tarih seçin
          </div>
        )}
        
        {/* Rezervasyon hatası varsa gösterilen mesaj */}
        {reservationError && (
          <Alert variant="destructive" className="p-2 sm:p-4 text-xs sm:text-sm">
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <AlertTitle className="text-xs sm:text-sm font-medium">Rezervasyon Hatası</AlertTitle>
            <AlertDescription className="text-xs sm:text-sm">
              {reservationError}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Fiyat hatası varsa gösterilen mesaj */}
        {priceError && (
          <Alert variant="destructive" className="p-2 sm:p-4 text-xs sm:text-sm">
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <AlertTitle className="text-xs sm:text-sm font-medium">Fiyat Hesaplama Hatası</AlertTitle>
            <AlertDescription className="text-xs sm:text-sm">
              {priceError}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Fiyat Detayları */}
        {showPriceDetails && (
          <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4 space-y-2 sm:space-y-3">
            {/* Özet Fiyat Gösterimi */}
            <div className="flex justify-between items-start sm:items-center">
              <div className="text-xs sm:text-sm font-medium">
                {checkinDate && checkoutDate ? (
                  <div className="space-y-0.5 sm:space-y-1">
                    <div>{totalDays} gece</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground max-w-[150px] sm:max-w-none">
                      {new Date(checkinDate).toLocaleDateString('tr-TR', {day: 'numeric', month: 'short'})} - {new Date(checkoutDate).toLocaleDateString('tr-TR', {day: 'numeric', month: 'short'})}
                    </div>
                  </div>
                ) : (
                  <div>Konaklama</div>
                )}
              </div>
              <div className="font-medium text-xs sm:text-sm">
                {priceCalculation.averagePrice ? 
                  <div className="text-right">
                    <div>{Math.round(priceCalculation.averagePrice).toLocaleString('tr-TR')} ₺<span className="text-[10px] sm:text-xs text-muted-foreground ml-1">/ gece</span></div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">{priceCalculation.totalAmount.toLocaleString('tr-TR')} ₺ toplam</div>
                  </div>
                  :
                  nightlyPrice.toLocaleString('tr-TR')
                } 
              </div>
            </div>
            
            {/* Fiyat Detay Butonu */}
            <button 
              type="button"
              onClick={() => setShowDetailedPrices(!showDetailedPrices)}
              className="flex items-center text-[10px] sm:text-xs text-primary hover:underline w-full justify-center py-2 px-2 focus:outline-none focus:ring-2 focus:ring-primary/10 rounded"
            >
              {showDetailedPrices ? (
                <>Detayları Gizle <ChevronUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 ml-0.5 sm:ml-1" /></>
              ) : (
                <>Günlük Fiyat Detaylarını Göster <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 ml-0.5 sm:ml-1" /></>
              )}
            </button>
            
            {/* Detaylı Günlük Fiyatlar - renderDailyPrices fonksiyonunu kullan */}
            {showDetailedPrices && renderDailyPrices()}
            
            <Separator className="my-1 sm:my-2" />
            
            {/* Toplam Konaklama Ücreti */}
            <div className="flex justify-between text-xs sm:text-sm">
              <div>Konaklama ({totalDays} gece)</div>
              <div className="font-medium">
                {priceCalculation.totalAmount.toLocaleString('tr-TR')} ₺
              </div>
            </div>
            
            {/* Temizlik Ücreti (varsa) */}
            {priceCalculation.appliedCleaningFee > 0 && (
              <div className="flex justify-between text-xs sm:text-sm">
                <div className="flex flex-wrap items-center gap-x-1">
                  <span>Temizlik ücreti</span>
                  <span className="text-[9px] sm:text-xs text-gray-500">(Kısa konaklama)</span>
                </div>
                <div className="font-medium">
                  {priceCalculation.appliedCleaningFee.toLocaleString('tr-TR')} ₺
                </div>
              </div>
            )}
            
            {/* Depozito (varsa) */}
            {depositAmount > 0 && (
              <div className="flex flex-col space-y-0.5 sm:space-y-1">
                <div className="flex justify-between text-xs sm:text-sm">
                  <div className="flex items-center flex-wrap gap-x-1">
                    <span>Depozito</span>
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center text-muted-foreground cursor-help">
                            <span className="text-[9px] sm:text-xs">(İade edilecek)</span>
                            <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-0.5 sm:ml-1" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent 
                          side={isMobile ? "bottom" : "top"} 
                          className="max-w-[250px] sm:max-w-xs p-3 sm:p-4 text-xs sm:text-sm bg-white shadow-md rounded-lg border-none"
                        >
                          <div className="flex flex-col space-y-1 sm:space-y-2">
                            <h4 className="font-semibold text-primary">Depozito Hakkında</h4>
                            <p className="text-[10px] sm:text-xs text-black">
                              Depozito, villa girişinde nakit olarak alınır ve çıkışta villa kontrolü sonrasında iade edilir. Herhangi bir hasar veya eksiklik durumunda kesinti yapılabilir.
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="font-medium">
                    {depositAmount.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
              </div>
            )}
            
            <Separator className="my-1 sm:my-2" />
            
            {/* Genel Toplam */}
            <div className="flex justify-between font-semibold text-xs sm:text-sm">
              <div>Toplam</div>
              <div className="text-primary">
                {priceCalculation.finalTotal.toLocaleString('tr-TR')} ₺
              </div>
            </div>
            
            {/* Ödeme Tipi Seçimi */}
            {paymentCalculation && (
              <PaymentTypeSelector
                selectedPaymentType={selectedPaymentType}
                onPaymentTypeChange={handlePaymentTypeChange}
                advanceAmount={paymentCalculation.currentPayment}
                remainingAmount={paymentCalculation.remainingPayment}
                totalAmount={priceCalculation.finalTotal}
              />
            )}
            
            {/* Ödeme Yöntemi Seçimi */}
            {paymentCalculation && (
              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                onMethodChange={handlePaymentMethodChange}
                className="mt-2 sm:mt-4"
              />
            )}
            
            {/* Ödeme Bilgilendirmesi */}
            {paymentCalculation && (
              <div className="text-xs sm:text-sm text-gray-600 mt-2 p-2 sm:p-3 bg-primary/5 rounded-md">
                {paymentCalculation.paymentInfo}
              </div>
            )}
          </div>
        )}
        
        {/* İletişim Formu - Her durumda göster */}
        {showPriceDetails && (
          <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
            <ContactForm 
              onSubmit={handleContactFormSubmit}
              className={contactInfo ? "opacity-60 pointer-events-none" : ""}
            />
            {contactInfo && (
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-50 rounded-md text-green-700 text-xs sm:text-sm flex items-center">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                İletişim bilgileriniz kaydedildi
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-2 sm:px-3 md:px-6 pb-2 sm:pb-3 md:pb-6 pt-0">
        <Button 
          className="w-full text-xs sm:text-sm py-2 sm:py-2.5 md:py-3 h-auto" 
          size="lg"
          onClick={handleReservation}
          disabled={
            !checkinDate || 
            !checkoutDate || 
            isLoading || 
            !priceCalculation || 
            guestCount === 0
          }
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="animate-spin h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1 sm:mr-1.5 md:mr-2" />
              İşleniyor...
            </span>
          ) : !checkinDate || !checkoutDate 
            ? 'Tarih Seçin' 
            : 'Rezervasyon Talebi Gönder'
          }
        </Button>
      </CardFooter>
    </Card>
  );
} 