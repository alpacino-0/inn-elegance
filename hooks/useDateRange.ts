import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import type { CalendarEvent } from '@/types/calendar';

interface UseDateRangeProps {
  villaId: string;
}

interface UseDateRangeReturn {
  calendarEvents: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  refetch: (startDate?: string, endDate?: string) => Promise<void>;
}

export const useDateRange = ({ villaId }: UseDateRangeProps): UseDateRangeReturn => {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarEvents = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Eğer startDate veya endDate belirtilmemişse, varsayılan değerleri kullan
      const defaultDateRange = () => {
        const today = new Date();
        const sixMonthsLater = new Date();
        sixMonthsLater.setMonth(today.getMonth() + 6);
    
        return {
          startDate: format(today, 'yyyy-MM-dd'),
          endDate: format(sixMonthsLater, 'yyyy-MM-dd')
        };
      };
      
      const { startDate: defaultStart, endDate: defaultEnd } = defaultDateRange();
      const queryStartDate = startDate || defaultStart;
      const queryEndDate = endDate || defaultEnd;

      const response = await fetch(
        `/api/villas/${villaId}/calendar-events?startDate=${queryStartDate}&endDate=${queryEndDate}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Takvim olayları alınamadı');
      }

      const data: CalendarEvent[] = await response.json();
      setCalendarEvents(data);
    } catch (error) {
      console.error('Takvim olayları yüklenirken hata:', error);
      setError(error instanceof Error ? error.message : 'Takvim olayları yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, [villaId]);

  // İlk yükleme sırasında takvim olaylarını getir
  useEffect(() => {
    fetchCalendarEvents();
  }, [fetchCalendarEvents]);

  return {
    calendarEvents,
    isLoading,
    error,
    refetch: fetchCalendarEvents
  };
};

export default useDateRange; 