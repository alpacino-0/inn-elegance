import { createClient } from '@/utils/supabase/client';
import { 
  PaymentType, 
  ReservationStatus 
} from '@/types/reservation';
import type { 
  Reservation, 
  ReservationFormData, 
  ReservationResponse
} from '@/types/reservation';
import { addDays } from 'date-fns';

/**
 * Benzersiz rezervasyon referans kodu oluşturur
 */
function generateBookingReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VL-${timestamp.slice(-4)}${randomChars}`;
}

/**
 * Rezervasyon servisi
 * Rezervasyon oluşturma, güncelleme, iptal etme işlemlerini yönetir
 */
export const ReservationService = {
  /**
   * Yeni rezervasyon oluşturur
   */
  async createReservation(formData: ReservationFormData): Promise<ReservationResponse> {
    try {
      // Supabase istemcisini oluştur
      const supabase = createClient();
      
      // Benzersiz rezervasyon referans kodu oluştur
      const bookingRef = generateBookingReference();
      
      // Date nesnesi kontrolü ve dönüşümü
      const safeStartDate = formData.startDate instanceof Date && !Number.isNaN(formData.startDate.getTime())
        ? formData.startDate.toISOString()
        : new Date(formData.startDate).toISOString();
        
      const safeEndDate = formData.endDate instanceof Date && !Number.isNaN(formData.endDate.getTime())
        ? formData.endDate.toISOString()
        : new Date(formData.endDate).toISOString();
      
      // Rezervasyon verilerini hazırla
      const reservationData = {
        bookingRef,
        villaId: formData.villaId,
        currencyId: null, // Varsayılan olarak null, gerekirse dinamik olarak eklenebilir
        startDate: safeStartDate,
        endDate: safeEndDate,
        guestCount: formData.guestCount,
        totalAmount: formData.totalPrice,
        advanceAmount: formData.advancePayment,
        remainingAmount: formData.remainingAmount,
        paymentType: formData.paymentType,
        paymentMethod: formData.paymentMethod,
        // Ödeme tipi SPLIT_PAYMENT ise ödeme tarihi 2 gün sonra, aksi durumda bugün
        paymentDueDate: (formData.paymentType === PaymentType.SPLIT_PAYMENT) 
          ? addDays(new Date(), 2).toISOString() 
          : new Date().toISOString(),
        status: ReservationStatus.PENDING,
        customerName: formData.contactInfo.fullName,
        customerEmail: formData.contactInfo.email,
        customerPhone: formData.contactInfo.phone,
        customerNotes: null, // İsteğe bağlı notlar
        userId: null, // Public projede kullanıcı ID'si null
      };

      // Supabase'e rezervasyon kaydı oluştur
      const { data, error } = await supabase
        .from('Reservation')
        .insert(reservationData)
        .select('id')
        .single();

      if (error) {
        console.error('Rezervasyon oluşturulurken hata:', error);
        throw new Error(`Rezervasyon oluşturulurken hata: ${error.message}`);
      }

      // Başarılı cevap döndür
      return {
        success: true,
        message: 'Rezervasyon başarıyla oluşturuldu',
        reservationId: data.id,
        bookingRef
      };
    } catch (err) {
      console.error('Rezervasyon oluşturma hatası:', err);
      const errorMessage = err instanceof Error ? err.message : 'Rezervasyon oluşturulurken bir hata oluştu';
      
      // Hata cevabı döndür
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  /**
   * Rezervasyon durumunu günceller
   */
  async updateReservationStatus(
    id: string, 
    status: ReservationStatus, 
    reason?: string
  ): Promise<ReservationResponse> {
    try {
      // Supabase istemcisini oluştur
      const supabase = createClient();
      
      const updateData: {
        status: ReservationStatus;
        cancellationReason?: string | null;
        cancelledAt?: string | null;
      } = { status };

      // Eğer rezervasyon iptal ediliyorsa, iptal nedenini ve tarihini ekle
      if (status === ReservationStatus.CANCELLED) {
        updateData.cancellationReason = reason || null;
        updateData.cancelledAt = new Date().toISOString();
      }

      // Supabase'de rezervasyon durumunu güncelle
      const { data, error } = await supabase
        .from('Reservation')
        .update(updateData)
        .eq('id', id)
        .select('bookingRef')
        .single();

      if (error) {
        throw new Error(`Rezervasyon durumu güncellenirken hata: ${error.message}`);
      }

      return {
        success: true,
        message: 'Rezervasyon durumu başarıyla güncellendi',
        bookingRef: data.bookingRef
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Rezervasyon durumu güncellenirken bir hata oluştu';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  /**
   * Rezervasyon bilgilerini getirir
   */
  async getReservationByRef(bookingRef: string): Promise<Reservation | null> {
    try {
      // Supabase istemcisini oluştur
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('Reservation')
        .select('*')
        .eq('bookingRef', bookingRef)
        .single();

      if (error) {
        throw new Error(`Rezervasyon bilgileri alınırken hata: ${error.message}`);
      }

      return data as unknown as Reservation;
    } catch (err) {
      console.error('Rezervasyon bilgileri alınırken hata:', err);
      return null;
    }
  },
  
  /**
   * Rezervasyon bilgilerini e-posta ve referans kodu ile doğrular
   */
  async verifyReservationByEmail(bookingRef: string, email: string): Promise<Reservation | null> {
    try {
      // Önce rezervasyonu al
      const reservation = await this.getReservationByRef(bookingRef);
      
      // Rezervasyon bulunamadı veya e-posta eşleşmiyor
      if (!reservation || reservation.customerEmail.toLowerCase() !== email.toLowerCase()) {
        return null;
      }
      
      return reservation;
    } catch (err) {
      console.error('Rezervasyon doğrulanırken hata:', err);
      return null;
    }
  },
}; 