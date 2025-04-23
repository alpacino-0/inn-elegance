import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// API rotası için segment config
export const dynamic = 'force-dynamic';

// POST - Tüm villaların etiketlerini güncelle
export async function POST() {
  try {
    const supabase = await createClient();
    
    // SQL sorgusunu doğrudan çalıştırma
    const { error } = await supabase.rpc('update_villa_tags');
    
    if (error) {
      console.error('Villa etiketleri güncellenirken hata:', error);
      return NextResponse.json(
        { error: 'Villa etiketleri güncellenirken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Villa etiketleri başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Villa etiketleri güncelleme API hatası:', error);
    return NextResponse.json(
      { error: 'Villa etiketleri güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 