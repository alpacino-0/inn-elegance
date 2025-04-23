import { createClient } from '@/utils/supabase/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// GET - Tüm bölgeleri veya filtrelenmiş bölgeleri listeler
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Filtreleme parametreleri
    const isActive = searchParams.get('isActive');
    const isMainRegion = searchParams.get('isMainRegion');
    const isPromoted = searchParams.get('isPromoted');
    const parentId = searchParams.get('parentId');
    
    // Temel sorgu
    let query = supabase
      .from('Region')
      .select('*')
      .order('name');
    
    // Filtreler ekleniyor
    if (isActive === 'true') {
      query = query.eq('isActive', true);
    } else if (isActive === 'false') {
      query = query.eq('isActive', false);
    }
    
    if (isMainRegion === 'true') {
      query = query.eq('isMainRegion', true);
    } else if (isMainRegion === 'false') {
      query = query.eq('isMainRegion', false);
    }
    
    if (isPromoted === 'true') {
      query = query.eq('isPromoted', true);
    } else if (isPromoted === 'false') {
      query = query.eq('isPromoted', false);
    }
    
    if (parentId) {
      query = query.eq('parentId', parentId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: 'Bölgeler alınırken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Bölgeler API hatası:', error);
    return NextResponse.json(
      { error: 'Bölgeler alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Yeni bir bölge ekler
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const regionData = await request.json();
    
    // İstek verilerini doğrulama
    if (!regionData.name) {
      return NextResponse.json(
        { error: 'Bölge adı gereklidir' },
        { status: 400 }
      );
    }
    
    // Ana bölge ise parentId temizleniyor
    if (regionData.isMainRegion) {
      regionData.parentId = null;
    }
    
    // Slug oluşturma (eğer yoksa)
    if (!regionData.slug && regionData.name) {
      regionData.slug = regionData.name
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    const { data, error } = await supabase
      .from('Region')
      .insert([regionData])
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Bölge eklenirken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Bölge ekleme API hatası:', error);
    return NextResponse.json(
      { error: 'Bölge eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 