import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Villa açıklamasını güncellemek için PATCH endpoint'i
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ villaId: string }> }
) {
  try {
    const { villaId } = await params;
    const { description } = await req.json();

    if (!villaId) {
      return NextResponse.json(
        { error: "Villa ID gereklidir" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: "Geçerli bir açıklama metni gereklidir" },
        { status: 400 }
      );
    }

    // Supabase bağlantısı oluşturma
    const supabase = await createClient();

    // Villa açıklamasını güncelleme
    const { data, error } = await supabase
      .from('Villa')
      .update({ 
        description,
        updatedAt: new Date().toISOString() // updatedAt alanını otomatik güncelle
      })
      .eq('id', villaId)
      .select('id, title, description')
      .single();

    if (error) {
      console.error('Villa güncelleme hatası:', error);
      return NextResponse.json(
        { error: `Villa güncellenirken hata oluştu: ${error.message}` },
        { status: 500 }
      );
    }

    // Başarılı yanıt
    return NextResponse.json({
      data,
      success: true,
      message: "Villa açıklaması başarıyla güncellendi"
    });

  } catch (error) {
    console.error('API hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    
    return NextResponse.json(
      { error: `Villa güncelleme hatası: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Villa detaylarını getirmek için GET endpoint'i
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ villaId: string }> }
) {
  try {
    const { villaId } = await params;

    if (!villaId) {
      return NextResponse.json(
        { error: "Villa ID gereklidir" },
        { status: 400 }
      );
    }

    // Supabase bağlantısı oluşturma
    const supabase = await createClient();

    // Villa verilerini alma
    const { data, error } = await supabase
      .from('Villa')
      .select('*')
      .eq('id', villaId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Villa verisi alınamadı: ${error.message}` },
        { status: 500 }
      );
    }

    // Başarılı yanıt
    return NextResponse.json({
      data,
      success: true
    });

  } catch (error) {
    console.error('API hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    
    return NextResponse.json(
      { error: `Villa verisi alınırken hata oluştu: ${errorMessage}` },
      { status: 500 }
    );
  }
} 