import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// API rotası için segment config
export const dynamic = 'force-dynamic';

// CalendarEvent için tipleri tanımla
interface CalendarEventUpdate {
  date?: string;
  status?: 'AVAILABLE' | 'PENDING' | 'RESERVED' | 'BLOCKED';
  price?: number | null;
  note?: string | null;
  eventType?: 'CHECKIN' | 'CHECKOUT' | 'SPECIAL_OFFER' | null;
  reservationId?: string | null;
}

// GET - Takvim olaylarını listele
export async function GET(request: NextRequest) {
  try {
    // URL parametrelerini al
    const searchParams = request.nextUrl.searchParams;
    const villaId = searchParams.get('villaId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status'); // İsteğe bağlı durum filtresi
    
    console.log('API isteği alındı:', {
      villaId,
      startDate,
      endDate,
      status
    });
    
    // Parametre kontrolü
    if (!villaId) {
      return NextResponse.json(
        { error: 'Villa ID parametresi gereklidir' },
        { status: 400 }
      );
    }
    
    // Veritabanı bağlantısı ve sorgu
    const supabase = await createClient();
    
    // Önce villanın var olup olmadığını kontrol et
    const { error: villaError } = await supabase
      .from('Villa')
      .select('id')
      .eq('id', villaId)
      .single();

    if (villaError && villaError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Villa bulunamadı' },
        { status: 404 }
      );
    }
    
    // Sorgu oluştur - sadece villaId ile sorgula
    let query = supabase
      .from('CalendarEvent')
      .select('*')
      .eq('villaId', villaId);

    // Eğer tarih aralığı belirtilmişse, onu da ekle
    if (startDate && endDate) {
      console.log('Tarih filtresi uygulanıyor:', { startDate, endDate });
      query = query.gte('date', startDate).lte('date', endDate);
    }
    
    // Eğer durum filtresi belirtilmişse
    if (status) {
      query = query.eq('status', status);
    }

    // Duruma göre sıralama - en yeni tarihler önce
    query = query.order('date', { ascending: true });

    console.log('Veritabanı sorgusu oluşturuldu');

    // Sorguyu çalıştır
    const { data, error } = await query;

    // Sorgu sonuçlarını kontrol et
    console.log('Veritabanı sorgusu tamamlandı:', {
      success: !error,
      dataCount: data?.length,
      error: error ? error.message : null
    });

    if (error) {
      console.error('Veritabanı sorgu hatası:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // Başarılı yanıt
    return NextResponse.json(data);
  } catch (error) {
    console.error('Takvim olayları API hatası:', error);
    return NextResponse.json(
      { error: 'Takvim olayları alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Yeni takvim olayı oluştur
export async function POST(request: NextRequest) {
  try {
    // İstek verisini al
    const eventData = await request.json();
    
    // Gerekli alanları kontrol et
    if (!eventData.villaId || !eventData.date) {
      return NextResponse.json(
        { error: 'Villa ID ve tarih alanları zorunludur' },
        { status: 400 }
      );
    }
    
    // Veritabanı bağlantısı
    const supabase = await createClient();
    
    // Önce villanın var olup olmadığını kontrol et
    const { error: villaError } = await supabase
      .from('Villa')
      .select('id')
      .eq('id', eventData.villaId)
      .single();

    if (villaError && villaError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Villa bulunamadı' },
        { status: 404 }
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
    const validEventTypes = ['CHECKIN', 'CHECKOUT', 'SPECIAL_OFFER'];
    if (eventData.eventType && !validEventTypes.includes(eventData.eventType)) {
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
    
    // Yeni takvim olayı oluştur
    const { data, error } = await supabase
      .from('CalendarEvent')
      .insert({
        villaId: eventData.villaId,
        date: eventData.date,
        status: eventData.status || 'AVAILABLE', // Varsayılan değer
        price: eventData.price || null,
        note: eventData.note || null,
        eventType: eventData.eventType || null,
        reservationId: eventData.reservationId || null
      })
      .select()
      .single();
    
    if (error) {
      // Benzersiz kısıt hatası kontrolü
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Bu villa için bu tarihte zaten bir etkinlik var' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Takvim olayı eklenirken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Takvim olayı ekleme hatası:', error);
    return NextResponse.json(
      { error: 'Takvim olayı eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PATCH - Varolan takvim olayını güncelle
export async function PATCH(request: NextRequest) {
  try {
    // İstek verisini al
    const eventData = await request.json();
    
    // ID kontrolü
    if (!eventData.id) {
      return NextResponse.json(
        { error: 'Güncellenecek takvim olayı ID\'si zorunludur' },
        { status: 400 }
      );
    }
    
    // Veritabanı bağlantısı
    const supabase = await createClient();
    
    // Önce etkinliğin var olup olmadığını kontrol et
    const { data: existingEvent, error: checkError } = await supabase
      .from('CalendarEvent')
      .select('*')
      .eq('id', eventData.id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Takvim olayı bulunamadı' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Takvim olayı kontrol edilirken bir hata oluştu', details: checkError.message },
        { status: 500 }
      );
    }
    
    // Villa ID'nin değiştirilmesine izin verme
    if (eventData.villaId && eventData.villaId !== existingEvent.villaId) {
      return NextResponse.json(
        { error: 'Villa ID değiştirilemez' },
        { status: 400 }
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
      .eq('id', eventData.id)
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
export async function DELETE(request: NextRequest) {
  try {
    // URL'den ID'yi al
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Silinecek takvim olayı ID\'si gereklidir' },
        { status: 400 }
      );
    }
    
    // Veritabanı bağlantısı
    const supabase = await createClient();
    
    // Önce etkinliğin var olup olmadığını kontrol et
    const { data: existingEvent, error: checkError } = await supabase
      .from('CalendarEvent')
      .select('id, villaId, date')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Takvim olayı bulunamadı' },
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
      .eq('id', id);
    
    if (error) {
      return NextResponse.json(
        { error: 'Takvim olayı silinirken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Takvim olayı başarıyla silindi',
      id,
      villaId: existingEvent.villaId,
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