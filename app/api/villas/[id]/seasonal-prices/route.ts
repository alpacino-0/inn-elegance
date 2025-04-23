import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { CreateSeasonalPriceDto, SeasonalPriceFilters } from '@/types/seasonal-price';

// API rotası için segment config
export const dynamic = 'force-dynamic';

// GET - Belirli bir villaya ait tüm sezon fiyatlarını listele
export async function GET(request: NextRequest) {
  try {
    // URL'den ID'yi al, parametre kullanmadan
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const villaId = pathSegments[pathSegments.length - 2]; // seasonal-prices'tan önceki segment
    
    const searchParams = request.nextUrl.searchParams;

    // Filtreleri al
    const filters: SeasonalPriceFilters = {};
    if (searchParams.has('isActive')) {
      filters.isActive = searchParams.get('isActive') === 'true';
    }
    if (searchParams.has('startDateAfter')) {
      filters.startDateAfter = searchParams.get('startDateAfter') || undefined;
    }
    if (searchParams.has('endDateBefore')) {
      filters.endDateBefore = searchParams.get('endDateBefore') || undefined;
    }
    if (searchParams.has('currencyId')) {
      filters.currencyId = searchParams.get('currencyId') || undefined;
    }

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

    // Villa sezon fiyatları getir
    let query = supabase
      .from('SeasonalPrice')
      .select(`
        *,
        currency:currencyId (
          id, code, name, symbol
        )
      `)
      .eq('villaId', villaId)
      .order('startDate', { ascending: true });

    // Filtreleri uygula
    if (filters.isActive !== undefined) {
      query = query.eq('isActive', filters.isActive);
    }
    if (filters.startDateAfter) {
      query = query.gte('startDate', filters.startDateAfter);
    }
    if (filters.endDateBefore) {
      query = query.lte('endDate', filters.endDateBefore);
    }
    if (filters.currencyId) {
      query = query.eq('currencyId', filters.currencyId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Sezon fiyatları alınırken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Villa sezon fiyatları API hatası:', error);
    return NextResponse.json(
      { error: 'Sezon fiyatları alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Villaya yeni bir sezon fiyatı ekle
export async function POST(request: NextRequest) {
  try {
    // URL'den ID'yi al, parametre kullanmadan
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const villaId = pathSegments[pathSegments.length - 2]; // seasonal-prices'tan önceki segment
    
    const priceData: CreateSeasonalPriceDto = await request.json();

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
    if (!priceData.seasonName || !priceData.startDate || !priceData.endDate || !priceData.currencyId) {
      return NextResponse.json(
        { error: 'Zorunlu alanlar eksik', details: 'Sezon adı, başlangıç tarihi, bitiş tarihi ve para birimi gereklidir' },
        { status: 400 }
      );
    }

    if (priceData.nightlyPrice <= 0) {
      return NextResponse.json(
        { error: 'Gecelik fiyat sıfırdan büyük olmalıdır' },
        { status: 400 }
      );
    }

    // Başlangıç tarihi bitiş tarihinden önce olmalı
    if (new Date(priceData.startDate) >= new Date(priceData.endDate)) {
      return NextResponse.json(
        { error: 'Başlangıç tarihi bitiş tarihinden önce olmalıdır' },
        { status: 400 }
      );
    }

    // Veritabanına ekleme işlemi
    const { data, error } = await supabase
      .from('SeasonalPrice')
      .insert({
        villaId,
        seasonName: priceData.seasonName,
        startDate: priceData.startDate,
        endDate: priceData.endDate,
        nightlyPrice: priceData.nightlyPrice,
        weeklyPrice: priceData.weeklyPrice || null,
        currencyId: priceData.currencyId,
        description: priceData.description || null,
        isActive: priceData.isActive !== undefined ? priceData.isActive : true
      })
      .select('*, currency:currencyId (id, code, name, symbol)')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Sezon fiyatı eklenirken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Sezon fiyatı ekleme API hatası:', error);
    return NextResponse.json(
      { error: 'Sezon fiyatı eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 