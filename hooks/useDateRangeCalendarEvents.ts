import { useState, useCallback } from 'react';
import type { CalendarEvent, CalendarEventCreateRequest, CalendarEventUpdateRequest } from '@/types/calendar';
import { format, eachDayOfInterval } from 'date-fns';

interface UseDateRangeCalendarEventsOptions {
  villaId: string;
}

interface UseDateRangeCalendarEventsReturn {
  loading: boolean;
  error: string | null;
  createEventsForDateRange: (
    startDate: Date,
    endDate: Date,
    eventData: Omit<CalendarEventCreateRequest, 'date'>
  ) => Promise<CalendarEvent[]>;
  updateEventsForDateRange: (
    startDate: Date,
    endDate: Date,
    eventData: Omit<CalendarEventUpdateRequest, 'date'>
  ) => Promise<boolean>;
  deleteEventsForDateRange: (
    startDate: Date,
    endDate: Date
  ) => Promise<boolean>;
}

export const useDateRangeCalendarEvents = (
  { villaId }: UseDateRangeCalendarEventsOptions
): UseDateRangeCalendarEventsReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Tarih aralığında olay oluştur
  const createEventsForDateRange = useCallback(async (
    startDate: Date,
    endDate: Date,
    eventData: Omit<CalendarEventCreateRequest, 'date'>
  ): Promise<CalendarEvent[]> => {
    try {
      setLoading(true);
      setError(null);
      
      // Tarih aralığındaki her gün için
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const results: CalendarEvent[] = [];
      
      // Her gün için API isteği yap
      for (const day of days) {
        const formattedDate = format(day, 'yyyy-MM-dd');
        
        const response = await fetch(`/api/villas/${villaId}/calendar-events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...eventData,
            date: formattedDate
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `${formattedDate} tarihli olay oluşturulamadı: ${errorData.error || 'Bilinmeyen hata'}`
          );
        }
        
        const newEvent: CalendarEvent = await response.json();
        results.push(newEvent);
      }
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Takvim olayları oluşturulurken bir hata oluştu';
      setError(errorMessage);
      console.error('Takvim olayları oluşturma hatası:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  // Tarih aralığında olay güncelle
  const updateEventsForDateRange = useCallback(async (
    startDate: Date,
    endDate: Date,
    eventData: Omit<CalendarEventUpdateRequest, 'date'>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Önce tarih aralığındaki olayları getir
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const fetchUrl = `/api/villas/${villaId}/calendar-events?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      const fetchResponse = await fetch(fetchUrl);
      
      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json();
        throw new Error(errorData.error || 'Takvim olayları alınamadı');
      }
      
      const existingEvents: CalendarEvent[] = await fetchResponse.json();
      
      // Her mevcut olayı güncelle
      for (const event of existingEvents) {
        const response = await fetch(`/api/villas/${villaId}/calendar-events/${event.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `${event.date} tarihli olay güncellenemedi: ${errorData.error || 'Bilinmeyen hata'}`
          );
        }
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Takvim olayları güncellenirken bir hata oluştu';
      setError(errorMessage);
      console.error('Takvim olayları güncelleme hatası:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  // Tarih aralığında olay sil
  const deleteEventsForDateRange = useCallback(async (
    startDate: Date,
    endDate: Date
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Önce tarih aralığındaki olayları getir
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const fetchUrl = `/api/villas/${villaId}/calendar-events?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      const fetchResponse = await fetch(fetchUrl);
      
      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json();
        throw new Error(errorData.error || 'Takvim olayları alınamadı');
      }
      
      const existingEvents: CalendarEvent[] = await fetchResponse.json();
      
      // Her olayı sil
      for (const event of existingEvents) {
        const response = await fetch(`/api/villas/${villaId}/calendar-events/${event.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `${event.date} tarihli olay silinemedi: ${errorData.error || 'Bilinmeyen hata'}`
          );
        }
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Takvim olayları silinirken bir hata oluştu';
      setError(errorMessage);
      console.error('Takvim olayları silme hatası:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  return {
    loading,
    error,
    createEventsForDateRange,
    updateEventsForDateRange,
    deleteEventsForDateRange
  };
}; 