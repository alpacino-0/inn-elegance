import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// API rotası için segment config
export const dynamic = 'force-dynamic';

// GET - Belirli bir villaya ait görüntüleri getir
export async function GET(request: NextRequest) {
  try {
    // URL'den ID'yi al, parametre kullanmadan
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const villaId = pathSegments[pathSegments.length - 2]; // images'ten önceki segment

    if (!villaId) {
      return NextResponse.json(
        { error: 'Villa ID\'si gereklidir' },
        { status: 400 }
      );
    }

    // Önce villanın var olup olmadığını kontrol et
    const supabase = await createClient();
    const { data: villa, error: villaError } = await supabase
      .from('Villa')
      .select('id')
      .eq('id', villaId)
      .single();

    if (villaError) {
      if (villaError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Villa bulunamadı' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Villa kontrol edilirken bir hata oluştu', details: villaError.message },
        { status: 500 }
      );
    }

    if (!villa) {
      return NextResponse.json(
        { error: 'Villa bulunamadı' },
        { status: 404 }
      );
    }

    // Villa görüntülerini getir
    const { data, error } = await supabase
      .from('VillaImage')
      .select('*')
      .eq('villaId', villaId)
      .order('displayOrder', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Görüntüler alınırken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Villa görüntüleri API hatası:', error);
    return NextResponse.json(
      { error: 'Görüntüler alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Villaya yeni bir görüntü ekle
export async function POST(request: NextRequest) {
  try {
    // URL'den ID'yi al, parametre kullanmadan
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const villaId = pathSegments[pathSegments.length - 2]; // images'ten önceki segment
    
    const imageData = await request.json();

    if (!villaId) {
      return NextResponse.json(
        { error: 'Villa ID\'si gereklidir' },
        { status: 400 }
      );
    }

    // Gerekli görüntü verilerini kontrol et
    if (!imageData.url || typeof imageData.url !== 'string') {
      return NextResponse.json(
        { error: 'Geçerli bir görüntü URL\'si gereklidir' },
        { status: 400 }
      );
    }

    // Önce villanın var olup olmadığını kontrol et
    const supabase = await createClient();
    const { data: villa, error: villaError } = await supabase
      .from('Villa')
      .select('id')
      .eq('id', villaId)
      .single();

    if (villaError) {
      if (villaError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Villa bulunamadı' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Villa kontrol edilirken bir hata oluştu', details: villaError.message },
        { status: 500 }
      );
    }

    if (!villa) {
      return NextResponse.json(
        { error: 'Villa bulunamadı' },
        { status: 404 }
      );
    }

    // Mevcut maksimum sıra numarasını bul
    const { data: maxOrderResult } = await supabase
      .from('VillaImage')
      .select('displayOrder')
      .eq('villaId', villaId)
      .order('displayOrder', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = maxOrderResult ? (maxOrderResult.displayOrder + 1) : 0;
    
    // Eğer eklenen görüntü öne çıkan olarak işaretlenecekse, diğer öne çıkan görüntüleri sıfırla
    if (imageData.isFeatured === true) {
      await supabase
        .from('VillaImage')
        .update({ isFeatured: false })
        .eq('villaId', villaId)
        .eq('isFeatured', true);
    }

    // Yeni görüntüyü ekle
    const { data, error } = await supabase
      .from('VillaImage')
      .insert([{
        villaId,
        url: imageData.url,
        alt: imageData.alt || null,
        title: imageData.title || null,
        isFeatured: imageData.isFeatured === true,
        displayOrder: nextOrder
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Görüntü eklenirken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Villa görüntü ekleme API hatası:', error);
    return NextResponse.json(
      { error: 'Görüntü eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 