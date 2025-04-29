import { useState, useCallback } from 'react';
import type { CalendarEvent, CalendarEventCreateRequest, CalendarEventUpdateRequest, CalendarStatus } from '@/types/calendar';

interface UseCalendarEventsOptions {
  villaId: string;
}

interface UseCalendarEventsReturn {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  fetchEvents: (startDate?: string, endDate?: string, status?: CalendarStatus) => Promise<CalendarEvent[] | undefined>;
  createEvent: (eventData: CalendarEventCreateRequest) => Promise<CalendarEvent | null>;
  updateEvent: (eventId: string, eventData: CalendarEventUpdateRequest) => Promise<CalendarEvent | null>;
  deleteEvent: (eventId: string) => Promise<boolean>;
}

export const useCalendarEvents = ({ villaId }: UseCalendarEventsOptions): UseCalendarEventsReturn => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Tüm olayları veya filtrelenmiş olayları getir
  const fetchEvents = useCallback(async (
    startDate?: string,
    endDate?: string,
    status?: CalendarStatus
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `/api/villas/${villaId}/calendar-events`;
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (status) params.append('status', status);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Takvim olayları alınamadı');
      }
      
      const data: CalendarEvent[] = await response.json();
      setEvents(data);
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Takvim olayları yüklenirken bir hata oluştu';
      setError(errorMessage);
      console.error('Takvim olayları yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  // Yeni olay oluştur
  const createEvent = useCallback(async (eventData: CalendarEventCreateRequest): Promise<CalendarEvent | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/villas/${villaId}/calendar-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Takvim olayı oluşturulamadı');
      }
      
      const newEvent: CalendarEvent = await response.json();
      setEvents(prev => [...prev, newEvent]);
      
      return newEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Takvim olayı oluşturulurken bir hata oluştu';
      setError(errorMessage);
      console.error('Takvim olayı oluşturma hatası:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  // Olay güncelle
  const updateEvent = useCallback(async (
    eventId: string,
    eventData: CalendarEventUpdateRequest
  ): Promise<CalendarEvent | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/villas/${villaId}/calendar-events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Takvim olayı güncellenemedi');
      }
      
      const updatedEvent: CalendarEvent = await response.json();
      
      // Mevcut olayları güncelle
      setEvents(prev => prev.map(event => 
        event.id === eventId ? updatedEvent : event
      ));
      
      return updatedEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Takvim olayı güncellenirken bir hata oluştu';
      setError(errorMessage);
      console.error('Takvim olayı güncelleme hatası:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  // Olay sil
  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/villas/${villaId}/calendar-events/${eventId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Takvim olayı silinemedi');
      }
      
      // Olayı listeden kaldır
      setEvents(prev => prev.filter(event => event.id !== eventId));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Takvim olayı silinirken bir hata oluştu';
      setError(errorMessage);
      console.error('Takvim olayı silme hatası:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent
  };
}; 