// Ödeme tipi için enum (Supabase tablomuzla eşleştirildi)
export enum PaymentType {
    FULL_PAYMENT = 'FULL_PAYMENT',
    SPLIT_PAYMENT = 'SPLIT_PAYMENT'
  }
  
  // Rezervasyon durumu için enum
  export enum ReservationStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED'
  }
  
  // Ödeme yöntemi için enum
  export enum PaymentMethod {
    CREDIT_CARD = 'CREDIT_CARD',
    BANK_TRANSFER = 'BANK_TRANSFER'
  }
  
  // Rezervasyon modeli
  export interface Reservation {
    id: string;
    bookingRef: string;
    villaId: string;
    currencyId: string | null;
    startDate: string;
    endDate: string;
    guestCount: number;
    totalAmount: number;
    advanceAmount: number;
    remainingAmount: number;
    paymentType: PaymentType;
    paymentMethod: PaymentMethod | string;
    paymentDueDate: string;
    status: ReservationStatus;
    cancellationReason: string | null;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerNotes: string | null;
    userId: string | null;
    createdAt: string;
    updatedAt: string;
    cancelledAt: string | null;
  }
  
  // Rezervasyon oluşturma için form verisi
  export interface ReservationFormData {
    villaId: string;
    startDate: Date;
    endDate: Date;
    guestCount: number;
    totalDays: number;
    totalPrice: number;
    cleaningFee: number;
    paymentType: PaymentType;
    paymentMethod: PaymentMethod | string;
    advancePayment: number;
    remainingAmount: number;
    contactInfo: {
      fullName: string;
      email: string;
      phone: string;
      acceptTerms: boolean;
      acceptPrivacy: boolean;
    };
  }
  
  // API yanıt yapısı
  export interface ReservationResponse {
    success: boolean;
    message?: string;
    error?: string;
    reservationId?: string;
    bookingRef?: string;
  } 