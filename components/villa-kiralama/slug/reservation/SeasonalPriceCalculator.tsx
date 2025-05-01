'use client';

import { useState, useEffect, useCallback } from "react";
import { addDays, differenceInDays, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useDateRange } from "@/hooks/use-date-range";
import type { CalendarEvent, EventType } from "@/types/calendar";

export interface SeasonalPrice {
  id: string;
  villaId: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  nightlyPrice: number;
  currency?: {
    symbol: string;
    code: string;
  };
}

export interface DailyPrice {
  date: string;
  price: number | null;
  isSpecialOffer: boolean;
  formattedDate: string;
  dayName: string;
  eventType: EventType;
}

export interface PriceCalculationResult {
  totalAmount: number;
  appliedCleaningFee: number;
  finalTotal: number;
  isShortStay: boolean;
  totalDays: number;
  dailyPrices: DailyPrice[];
  averagePrice: number;
}

// Takvim veri yapısı
export interface CalendarData {
  villaId: string;
  villaTitle: string;
  basePrice: number;
  minimumStay: number;
  startDate: string;
  endDate: string;
  dates: Array<{
    date: string;
    price: number | null;
    isSeasonalPrice: boolean;
    currency: string;
    status: string;
  }>;
}

// Ödeme tipi enum'u
export enum PaymentType {
  ADVANCE = 'ADVANCE', // %20 ön ödeme
  FULL = 'FULL'       // Tam ödeme
}

// Ödeme seçeneği enum'u - veritabanında kullanılan değer
export enum PaymentOption {
  FULL_PAYMENT = 'FULL_PAYMENT',   // Tam ödeme
  SPLIT_PAYMENT = 'SPLIT_PAYMENT'  // Bölünmüş ödeme (ön ödeme + kalan)
}

// Ödeme hesaplama sonucu
export interface PaymentCalculationResult {
  paymentOption: PaymentOption;
  currentPayment: number;
  remainingPayment: number;
  paymentInfo: string;
}

// Takvim verilerini getiren fonksiyonu optimize edelim
export async function fetchVillaCalendarData(villaId: string, startDate: Date, endDate: Date): Promise<CalendarData> {
  try {
    const start = format(startDate, 'yyyy-MM-dd');
    const end = format(endDate, 'yyyy-MM-dd');
    
    // AbortController ekleyerek isteklerin zaman aşımını yönetiyoruz
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 saniye zaman aşımı
    
    try {
      const response = await fetch(
        `/api/villas/${villaId}/calendar?start=${start}&end=${end}`,
        { 
          signal: controller.signal,
          // Cache yönetimini iyileştiriyoruz
          cache: 'no-cache' 
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Takvim verileri alınamadı');
      }
      
      return await response.json();
    } catch (err) {
      // Zaman aşımı ya da ağ hatalarını işliyoruz
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error('İstek zaman aşımına uğradı, lütfen daha sonra tekrar deneyin');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('Takvim verileri alınırken hata:', error);
    throw error;
  }
}

// Tarih aralığındaki toplam fiyatı hesaplama - CalendarEvent kullanacak şekilde güncellendi
export function calculateTotalPrice(
  startDate: Date, 
  endDate: Date, 
  calendarEvents: CalendarEvent[],
  cleaningFee = 0,
  shortStayDayLimit = 7
): PriceCalculationResult {
  
  // Tarih aralığını günlere böl
  const totalDays = Math.max(differenceInDays(endDate, startDate), 1);
  let totalAmount = 0;
  const dailyPrices: DailyPrice[] = [];
  
  // Her gün için fiyat hesapla
  for (let i = 0; i < totalDays; i++) {
    const currentDate = addDays(startDate, i);
    const formattedDate = format(currentDate, 'yyyy-MM-dd');
    
    // Takvim verileri içinde bu tarih için olay bul
    const event = calendarEvents.find(event => 
      format(new Date(event.date), 'yyyy-MM-dd') === formattedDate
    );
    
    if (!event || event.price === null) {
      throw new Error(`${formattedDate} tarihi için fiyat bilgisi bulunamadı.`);
    }
    
    // Fiyatı ekle
    totalAmount += Number(event.price);
    
    // Günlük fiyat bilgisini oluştur
    dailyPrices.push({
      date: formattedDate,
      price: event.price,
      isSpecialOffer: event.eventType === 'SPECIAL_OFFER',
      formattedDate: format(currentDate, 'd MMMM', { locale: tr }),
      dayName: format(currentDate, 'EEEE', { locale: tr }),
      eventType: event.eventType
    });
  }
  
  // Kısa konaklama ücreti kontrolü
  const isShortStay = totalDays < shortStayDayLimit;
  const appliedCleaningFee = isShortStay ? cleaningFee : 0;
  
  // Ortalama gecelik fiyat
  const averagePrice = totalDays > 0 ? totalAmount / totalDays : 0;
  
  return {
    totalAmount,
    appliedCleaningFee,
    finalTotal: totalAmount + appliedCleaningFee,
    isShortStay,
    totalDays,
    dailyPrices,
    averagePrice
  };
}

// Seçilen ödeme tipine göre ödeme tutarlarını hesapla
export function calculatePaymentAmounts(
  finalTotal: number,
  totalAmount: number,
  appliedCleaningFee: number,
  paymentType: PaymentType,
  advancePaymentRate = 0.2 // Varsayılan olarak %20
): PaymentCalculationResult {
  
  // ADVANCE ödeme tipi seçildiyse
  if (paymentType === PaymentType.ADVANCE) {
    // NOT: ADVANCE ödeme hesaplanırken sadece konaklama bedeli üzerinden advancePaymentRate hesaplanır
    // Temizlik ücreti (kısa konaklama) kalan ödeme kısmına eklenir
    const advanceAmount = totalAmount * advancePaymentRate;
    const remainingAmount = (totalAmount * (1-advancePaymentRate)) + appliedCleaningFee;
    
    return {
      paymentOption: PaymentOption.SPLIT_PAYMENT,
      currentPayment: advanceAmount,
      remainingPayment: remainingAmount,
      paymentInfo: `Şimdi ${advanceAmount.toLocaleString('tr-TR')} ₺ ödeyerek rezervasyonunuzu garantileyin. Kalan ${remainingAmount.toLocaleString('tr-TR')} ₺ villa girişinde ödenecektir.`
    };
  }
  
  // FULL ödeme tipi seçildiyse
  return {
    paymentOption: PaymentOption.FULL_PAYMENT, // Otomatik belirlenir
    currentPayment: finalTotal, // Konaklama + temizlik dahil tüm bedel
    remainingPayment: 0,
    paymentInfo: `Toplam tutarın tamamı olan ${finalTotal.toLocaleString('tr-TR')} ₺ şimdi ödenecektir.`
  };
}

// Hook'u güncellenmiş CalendarEvent yapısına uyarladık
export function useSeasonalPriceCalculator(
  villaId: string,
  startDate: Date | undefined,
  endDate: Date | undefined,
  cleaningFee = 0,
  shortStayDayLimit = 7,
  paymentType: PaymentType = PaymentType.FULL,
  advancePaymentRate = 0.2
) {
  const [isLoading, setIsLoading] = useState(false);
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculationResult | null>(null);
  const [paymentCalculation, setPaymentCalculation] = useState<PaymentCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // useDateRange hook'unu kullan - doğrudan Supabase'den verileri alacak
  const { calendarEvents, isLoading: isEventsLoading } = useDateRange(villaId);
  
  // calculatePayment fonksiyonunu memoize ediyoruz
  const calculatePayment = useCallback((priceResult: PriceCalculationResult) => {
    return calculatePaymentAmounts(
      priceResult.finalTotal,
      priceResult.totalAmount,
      priceResult.appliedCleaningFee,
      paymentType,
      advancePaymentRate
    );
  }, [paymentType, advancePaymentRate]);
  
  // Tarihler değiştiğinde fiyatları hesapla
  useEffect(() => {
    // Giriş ve çıkış tarihleri seçilmediyse hesaplama yapma
    if (!startDate || !endDate || !villaId || !calendarEvents || calendarEvents.length === 0) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fiyat hesaplaması yap
      const priceResult = calculateTotalPrice(
        startDate,
        endDate,
        calendarEvents,
        cleaningFee,
        shortStayDayLimit
      );
      
      setPriceCalculation(priceResult);
      
      // Ödeme hesaplaması yap
      const paymentResult = calculatePayment(priceResult);
      setPaymentCalculation(paymentResult);
      
    } catch (err: unknown) {
      console.error('Fiyat hesaplama hatası:', err);
      const errorMessage = err instanceof Error ? err.message : 'Fiyat hesaplanırken bir hata oluştu.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [villaId, startDate, endDate, calendarEvents, cleaningFee, shortStayDayLimit, calculatePayment]);
  
  // Ödeme tipi değiştiğinde ödeme hesaplama sonucunu güncelle
  useEffect(() => {
    if (priceCalculation) {
      const paymentResult = calculatePayment(priceCalculation);
      setPaymentCalculation(paymentResult);
    }
  }, [priceCalculation, calculatePayment]);
  
  return {
    isLoading: isLoading || isEventsLoading,
    calendarEvents,
    priceCalculation,
    paymentCalculation,
    error
  };
} 