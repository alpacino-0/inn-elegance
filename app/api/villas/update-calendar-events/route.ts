import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from '@/utils/supabase/server';

// Veri şeması doğrulaması
const updateCalendarSchema = z.object({
  villaId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// Tarih aralığını günlere ayıran yardımcı fonksiyon
function getDatesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  // Bitiş tarihi dahil olmayacak şekilde döngü (son gün checkout)
  while (currentDate < end) {
    dates.push(format(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

// Tarihi ISO string formatına çeviren yardımcı fonksiyon
function format(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function POST(req: Request) {
  console.log("update-calendar-events endpoint'i çağrıldı");
  
  try {
    // İstek gövdesini al
    const body = await req.json();
    console.log("Alınan istek gövdesi:", JSON.stringify(body));

    // İstek verilerini doğrula
    const validation = updateCalendarSchema.safeParse(body);
    if (!validation.success) {
      console.error("Şema doğrulama hatası:", JSON.stringify(validation.error.errors));
      return NextResponse.json(
        { error: "Geçersiz veri formatı", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { villaId, startDate, endDate } = validation.data;
    console.log("Doğrulanmış veriler:", { villaId, startDate, endDate });

    // Başlangıç tarihinin bitiş tarihinden önce olduğunu kontrol et
    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: "Başlangıç tarihi bitiş tarihinden önce olmalıdır" },
        { status: 400 }
      );
    }

    // Supabase bağlantısı
    const supabase = await createClient();
    console.log("Supabase bağlantısı oluşturuldu");

    // Villanın varlığını kontrol et
    const { error: villaError } = await supabase
      .from('Villa')
      .select('id')
      .eq('id', villaId)
      .single();

    if (villaError) {
      return NextResponse.json(
        { error: "Villa bulunamadı", details: villaError.message },
        { status: 404 }
      );
    }

    // Tarih aralığını günlük bazda al
    const dates = getDatesBetween(startDate, endDate);
    // Bitiş tarihini ekle - bu checkout günü olacak
    dates.push(endDate);
    
    // İşlem için transaction olmadığından, tüm günleri tek tek güncelleyeceğiz
    const results = [];
    const errors = [];

    // Başlangıç tarihini CHECKIN olarak işaretle
    const { data: checkinData, error: checkinError } = await supabase
      .from('CalendarEvent')
      .upsert({
        villaId,
        date: startDate,
        status: 'AVAILABLE',
        eventType: 'CHECKIN'
      }, { onConflict: 'villaId,date' })
      .select()
      .single();

    if (checkinError) {
      errors.push({ date: startDate, error: checkinError.message });
    } else {
      results.push(checkinData);
    }

    // Bitiş tarihini CHECKOUT olarak işaretle
    const { data: checkoutData, error: checkoutError } = await supabase
      .from('CalendarEvent')
      .upsert({
        villaId,
        date: endDate,
        status: 'AVAILABLE',
        eventType: 'CHECKOUT'
      }, { onConflict: 'villaId,date' })
      .select()
      .single();

    if (checkoutError) {
      errors.push({ date: endDate, error: checkoutError.message });
    } else {
      results.push(checkoutData);
    }

    // Aradaki günleri RESERVED olarak işaretle (başlangıç ve bitiş hariç)
    for (let i = 1; i < dates.length - 1; i++) {
      const date = dates[i];
      const { data, error } = await supabase
        .from('CalendarEvent')
        .upsert({
          villaId,
          date,
          status: 'RESERVED',
          eventType: null
        }, { onConflict: 'villaId,date' })
        .select()
        .single();

      if (error) {
        errors.push({ date, error: error.message });
      } else if (data) {
        results.push(data);
      }
    }

    // Hata kontrolü
    if (errors.length > 0) {
      return NextResponse.json({
        error: "Bazı günler güncellenirken hata oluştu",
        details: errors,
        successCount: results.length,
        totalDates: dates.length
      }, { status: 207 }); // 207 Multi-Status
    }

    return NextResponse.json({
      success: true,
      message: "Takvim başarıyla güncellendi",
      updatedDates: results.length,
      totalDates: dates.length
    });

  } catch (error) {
    console.error("İstek işleme hatası:", error);
    return NextResponse.json(
      { 
        error: "Takvim güncellenirken bir hata oluştu", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}