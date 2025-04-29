export type CalendarStatus = 'AVAILABLE' | 'PENDING' | 'RESERVED' | 'BLOCKED';
export type EventType = 'CHECKIN' | 'CHECKOUT' | 'SPECIAL_OFFER' | null;

export interface CalendarEvent {
  id: string;
  villaId: string;
  date: string;
  status: CalendarStatus;
  price: number | null;
  note: string | null;
  eventType: EventType;
  reservationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEventFormData {
  date: Date | null;
  status: CalendarStatus;
  price: string;
  note: string;
  eventType: EventType;
  reservationId: string | null;
}

export interface CalendarEventCreateRequest {
  date: string;
  status?: CalendarStatus;
  price?: number | null;
  note?: string | null;
  eventType?: EventType;
  reservationId?: string | null;
}

export interface CalendarEventUpdateRequest {
  date?: string;
  status?: CalendarStatus;
  price?: number | null;
  note?: string | null;
  eventType?: EventType;
  reservationId?: string | null;
} 