import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// API rotası için segment config
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// CalendarEvent için tipleri tanımla
interface CalendarEventUpdate {
  date?: string;
  status?: 'AVAILABLE' | 'PENDING' | 'RESERVED' | 'BLOCKED';
  price?: number | null;
  note?: string | null;
  eventType?: 'CHECKIN' | 'CHECKOUT' | 'SPECIAL_OFFER' | null;
  reservationId?: string | null;
}

// PATCH - Varolan takvim olayını güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    // Parametreleri almak için await kullanın
    const { id: villaId, eventId } = await params;
    
    // İstek verisini al
    const eventData = await request.json();
    
    // Veritabanı bağlantısı
    const supabase = await createClient();
    
    // Önce etkinliğin var olup olmadığını ve bu villaya ait olduğunu kontrol et
    const { error: checkError } = await supabase
      .from('CalendarEvent')
      .select('id')
      .eq('id', eventId)
      .eq('villaId', villaId)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Takvim olayı bulunamadı veya bu villa ile ilişkili değil' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Takvim olayı kontrol edilirken bir hata oluştu', details: checkError.message },
        { status: 500 }
      );
    }
    
    // Rezervasyon ID kontrolü
    if (eventData.reservationId) {
      const { error: reservationError } = await supabase
        .from('Reservation')
        .select('id')
        .eq('id', eventData.reservationId)
        .single();

      if (reservationError && reservationError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Belirtilen rezervasyon bulunamadı' },
          { status: 400 }
        );
      }
    }
    
    // Status değeri kontrolü
    const validStatuses = ['AVAILABLE', 'PENDING', 'RESERVED', 'BLOCKED'];
    if (eventData.status && !validStatuses.includes(eventData.status)) {
      return NextResponse.json(
        { error: 'Geçersiz durum değeri. Kabul edilen değerler: AVAILABLE, PENDING, RESERVED, BLOCKED' },
        { status: 400 }
      );
    }
    
    // EventType değeri kontrolü
    const validEventTypes = ['CHECKIN', 'CHECKOUT', 'SPECIAL_OFFER', null];
    if (eventData.eventType !== undefined && !validEventTypes.includes(eventData.eventType)) {
      return NextResponse.json(
        { error: 'Geçersiz etkinlik tipi. Kabul edilen değerler: CHECKIN, CHECKOUT, SPECIAL_OFFER' },
        { status: 400 }
      );
    }
    
    // Fiyat kontrolü
    if (eventData.price !== undefined && eventData.price !== null && 
        (Number.isNaN(Number(eventData.price)) || Number(eventData.price) < 0)) {
      return NextResponse.json(
        { error: 'Fiyat sıfırdan büyük bir sayı olmalıdır' },
        { status: 400 }
      );
    }
    
    // Güncelleme nesnesini oluştur
    const updates: CalendarEventUpdate = {};
    
    // Sadece belirtilen alanları güncelle
    if (eventData.date !== undefined) updates.date = eventData.date;
    if (eventData.status !== undefined) updates.status = eventData.status;
    if (eventData.price !== undefined) updates.price = eventData.price;
    if (eventData.note !== undefined) updates.note = eventData.note;
    if (eventData.eventType !== undefined) updates.eventType = eventData.eventType;
    if (eventData.reservationId !== undefined) updates.reservationId = eventData.reservationId;
    
    // Güncelleme işlemi
    const { data, error } = await supabase
      .from('CalendarEvent')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single();
    
    if (error) {
      // Benzersiz kısıt hatası kontrolü
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Bu villa için bu tarihte zaten başka bir etkinlik var' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Takvim olayı güncellenirken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Takvim olayı güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Takvim olayı güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Takvim olayını sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    // Parametreleri almak için await kullanın
    const { id: villaId, eventId } = await params;
    
    // Veritabanı bağlantısı
    const supabase = await createClient();
    
    // Önce etkinliğin var olup olmadığını ve bu villaya ait olduğunu kontrol et
    const { data: existingEvent, error: checkError } = await supabase
      .from('CalendarEvent')
      .select('id, villaId, date')
      .eq('id', eventId)
      .eq('villaId', villaId)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Takvim olayı bulunamadı veya bu villa ile ilişkili değil' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Takvim olayı kontrol edilirken bir hata oluştu', details: checkError.message },
        { status: 500 }
      );
    }
    
    // Silme işlemi
    const { error } = await supabase
      .from('CalendarEvent')
      .delete()
      .eq('id', eventId);
    
    if (error) {
      return NextResponse.json(
        { error: 'Takvim olayı silinirken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Takvim olayı başarıyla silindi',
      id: eventId,
      villaId,
      date: existingEvent.date
    });
  } catch (error) {
    console.error('Takvim olayı silme hatası:', error);
    return NextResponse.json(
      { error: 'Takvim olayı silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 