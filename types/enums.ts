export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  DELETED = 'DELETED'
}

// Veritabanı tablosunda kullanılan enum. CalendarEventStatus ile aynı değerlere sahip.
export enum CalendarStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  BLOCKED = 'BLOCKED'
}

// Takvim olaylarının tipini belirten enum
export enum EventType {
  CHECKIN = 'CHECKIN',
  CHECKOUT = 'CHECKOUT',
  SPECIAL_OFFER = 'SPECIAL_OFFER'
}

export enum Currency {
  TRY = 'TRY',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

export type VillaStatus = Status; 