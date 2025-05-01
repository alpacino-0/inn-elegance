import { NextResponse } from 'next/server';
import { ReservationService } from '@/lib/services/reservation-service';
import type { ReservationFormData } from '@/types/reservation';

/**
 * Rezervasyon oluşturma API endpoint'i
 */
export async function POST(request: Request) {
  try {
    // Request verilerini al
    const body = await request.json();
    
    // Form verilerini dönüştür
    const formData: ReservationFormData = {
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate)
    };
    
    // Rezervasyonu oluştur
    const result = await ReservationService.createReservation(formData);
    
    // Başarısız ise hata döndür
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Rezervasyon oluşturulurken bir hata oluştu' },
        { status: 400 }
      );
    }
    
    // Başarılı yanıt döndür
    return NextResponse.json({
      success: true,
      message: result.message,
      id: result.reservationId,
      bookingRef: result.bookingRef
    });
    
  } catch (error) {
    console.error('Rezervasyon API hatası:', error);
    
    // Hata durumunda
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Rezervasyon işlemi sırasında bir hata oluştu'
      },
      { status: 500 }
    );
  }
} 