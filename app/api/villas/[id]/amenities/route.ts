import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAmenitiesByVillaId, addAmenity } from '@/app/api/villa-amenities/utils';

// API rotası için segment config
export const dynamic = 'force-dynamic';

// GET - Belirli bir villaya ait tüm olanakları listele
export async function GET(request: NextRequest) {
  try {
    // URL'den ID'yi al, parametre kullanmadan
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const villaId = pathSegments[pathSegments.length - 2]; // amenities'ten önceki segment

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

    // Villa olanakları getir
    const { data, error } = await getAmenitiesByVillaId(villaId);

    if (error) {
      return NextResponse.json(
        { error: 'Olanaklar alınırken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Villa olanakları API hatası:', error);
    return NextResponse.json(
      { error: 'Olanaklar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Villaya yeni bir olanak ekle
export async function POST(request: NextRequest) {
  try {
    // URL'den ID'yi al, parametre kullanmadan
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const villaId = pathSegments[pathSegments.length - 2]; // amenities'ten önceki segment
    
    const amenityData = await request.json();

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

    // İstek verilerini doğrula
    if (!amenityData.name || typeof amenityData.name !== 'string' || amenityData.name.trim() === '') {
      return NextResponse.json(
        { error: 'Geçerli bir olanak adı gereklidir' },
        { status: 400 }
      );
    }

    // Icon alanını kontrol et
    const icon = amenityData.icon === null || amenityData.icon === undefined 
      ? null 
      : String(amenityData.icon);

    // Olanak ekle
    const { data, error } = await addAmenity({
      villaId,
      name: amenityData.name.trim(),
      icon
    });

    if (error) {
      return NextResponse.json(
        { error: 'Olanak eklenirken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Olanak ekleme API hatası:', error);
    return NextResponse.json(
      { error: 'Olanak eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 