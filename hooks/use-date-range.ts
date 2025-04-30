'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { CalendarStatus, EventType } from '@/types/enums';
import type { CalendarEvent } from '@/types/calendar';

export type DateRangeType = {
  startDate: Date | undefined;
  endDate: Date | undefined;
};

/**
 * useDateRange hook
 * 
 * Villa için tarih aralığını yönetir ve müsait tarih kontrolü yapar
 * @param villaId - Villa kimliği
 * @returns Tarih aralığı durumu, müsait tarihler ve ilgili fonksiyonlar
 */
export function useDateRange(villaId?: string) {
  const [dateRange, setDateRange] = useState<DateRangeType>({
    startDate: undefined,
    endDate: undefined
  });

  // Tarih aralığını güncelleme fonksiyonu
  const updateDateRange = useCallback((startDate?: Date, endDate?: Date) => {
    setDateRange({
      startDate,
      endDate
    });
  }, []);

  // Villa için takvim verilerini getir
  const { data: calendarEvents, isLoading } = useQuery({
    queryKey: ['calendarEvents', villaId],
    queryFn: async (): Promise<CalendarEvent[]> => {
      if (!villaId) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Bugünden itibaren bir yıl sonrasına kadar olan etkinlikleri getir
      const oneYearLater = new Date(today);
      oneYearLater.setFullYear(today.getFullYear() + 1);

      // Veritabanındaki tarih formatı ile uyumlu olması için 
      // tarihlerin saat bilgisini 14:00 UTC olarak ayarla
      const todayUTC = new Date(today);
      todayUTC.setUTCHours(14, 0, 0, 0);
      
      const oneYearLaterUTC = new Date(oneYearLater);
      oneYearLaterUTC.setUTCHours(14, 0, 0, 0);
      
      const todayStr = todayUTC.toISOString();
      const oneYearLaterStr = oneYearLaterUTC.toISOString();
      
      console.log(`Tarih aralığı sorgusu: ${todayStr} - ${oneYearLaterStr}`);

      const { data, error } = await createClient()
        .from('CalendarEvent')
        .select('id, villaId, date, status, price, note, eventType, reservationId')
        .eq('villaId', villaId)
        .gte('date', todayStr)
        .lte('date', oneYearLaterStr)
        .order('date', { ascending: true });

      if (error) {
        console.error('Takvim verileri getirilemedi:', error);
        return [];
      }

      console.log(`${villaId} ID'li villa için ${data?.length || 0} takvim kaydı bulundu`);
      
      // Veritabanından gelen tarihlerin tipini düzenle
      return data as CalendarEvent[];
    },
    enabled: !!villaId, // villaId varsa sorgu çalıştır
  });

  // Tarih müsait mi kontrol et - Sadece AVAILABLE olanları müsait olarak kabul et
  const isDateAvailable = useCallback((date: Date): boolean => {
    if (!calendarEvents) return true; // Veri yoksa müsait varsay
    
    // Tarih formatını veritabanı formatıyla uyumlu hale getir
    const checkDate = new Date(date);
    checkDate.setUTCHours(14, 0, 0, 0);
    
    const dateStr = checkDate.toISOString().split('T')[0];
    
    // Tarihle ilgili bir kayıt bulunuyor mu?
    const event = calendarEvents.find(e => {
      const eventDate = new Date(e.date);
      const eventDateStr = eventDate.toISOString().split('T')[0];
      return eventDateStr === dateStr;
    });
    
    // Eğer tarih için kayıt yoksa müsait varsay
    // Eğer kayıt varsa ve AVAILABLE ise müsait
    return event ? event.status === CalendarStatus.AVAILABLE : true;
  }, [calendarEvents]);

  // İki tarih arasındaki tüm günlerin müsait olup olmadığını kontrol et
  const areAllDatesAvailable = useCallback((start?: Date, end?: Date): boolean => {
    if (!start || !end || !calendarEvents) return false;
    
    // Başlangıç ve bitiş tarihleri arasındaki her günü kontrol et
    const checkDate = new Date(start);
    checkDate.setUTCHours(14, 0, 0, 0); // 14:00 UTC olarak ayarla
    
    const endDate = new Date(end);
    endDate.setUTCHours(14, 0, 0, 0); // 14:00 UTC olarak ayarla
    
    // Gece sayısı hesapla (end - start)
    const nightCount = Math.floor((endDate.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Her gece için kontrol et (check-in günleri)
    for (let i = 0; i < nightCount; i++) {
      if (!isDateAvailable(checkDate)) {
        return false;
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }
    
    return true;
  }, [calendarEvents, isDateAvailable]);

  // Seçilen tarih aralığındaki günler için fiyat hesapla
  const calculateTotalPrice = useCallback((): number | null => {
    if (!dateRange.startDate || !dateRange.endDate || !calendarEvents || calendarEvents.length === 0) {
      return null;
    }

    let totalPrice = 0;
    let dayCount = 0;
    const checkDate = new Date(dateRange.startDate);
    checkDate.setUTCHours(14, 0, 0, 0); // 14:00 UTC olarak ayarla
    
    const endDate = new Date(dateRange.endDate);
    endDate.setUTCHours(14, 0, 0, 0); // 14:00 UTC olarak ayarla
    
    // Gece sayısı hesapla
    const nightCount = Math.floor((endDate.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Her gece için fiyat kontrolü
    for (let i = 0; i < nightCount; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      
      // Bu tarih için kayıt var mı?
      const event = calendarEvents.find(e => {
        const eventDate = new Date(e.date);
        const eventDateStr = eventDate.toISOString().split('T')[0];
        return eventDateStr === dateStr;
      });
      
      // Eğer tarih AVAILABLE ve fiyatı varsa toplama ekle
      if (event?.status === CalendarStatus.AVAILABLE && event.price) {
        totalPrice += Number(event.price);
        dayCount++;
      }
      
      checkDate.setDate(checkDate.getDate() + 1);
    }
    
    return dayCount > 0 ? totalPrice : null;
  }, [dateRange, calendarEvents]);

  // Özel teklif (special offer) tarihleri bulma
  const getSpecialOfferDates = useCallback((): CalendarEvent[] => {
    if (!calendarEvents) return [];
    
    return calendarEvents.filter(event => 
      event.eventType?.includes(EventType.SPECIAL_OFFER) && 
      event.status === CalendarStatus.AVAILABLE
    );
  }, [calendarEvents]);

  return {
    dateRange,
    updateDateRange,
    calendarEvents,
    isLoading,
    isDateAvailable,
    areAllDatesAvailable,
    calculateTotalPrice,
    getSpecialOfferDates
  };
} 