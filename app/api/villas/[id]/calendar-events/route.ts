import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// API rotası için segment config - senkron dinamik API'ler için
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// GET - Takvim olaylarını listele
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // id parametresini almak için await kullanın
    const { id: villaId } = await params;
    
    // Sorgu parametrelerini al
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status'); // İsteğe bağlı durum filtresi
    
    console.log('API isteği alındı:', {
      villaId,
      startDate,
      endDate,
      status
    });
    
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
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // id parametresini almak için await kullanın
    const { id: villaId } = await params;
    
    // İstek verisini al
    const eventData = await request.json();
    
    // Gerekli alan kontrolü - artık villaId request body'den beklenmez
    if (!eventData.date) {
      return NextResponse.json(
        { error: 'Tarih alanı zorunludur' },
        { status: 400 }
      );
    }
    
    // Veritabanı bağlantısı
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
    
    // Yeni takvim olayı oluştur - villaId path'ten geliyor, body'den değil
    const { data, error } = await supabase
      .from('CalendarEvent')
      .insert({
        villaId: villaId, // Path'ten alınan villa ID
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