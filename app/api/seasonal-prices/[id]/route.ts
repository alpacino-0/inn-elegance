import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { UpdateSeasonalPriceDto } from '@/types/seasonal-price';

// API rotası için segment config
export const dynamic = 'force-dynamic';

// GET - Belirli bir sezon fiyatı detayını getir
export async function GET(request: NextRequest) {
  try {
    // URL'den ID'yi al, parametre kullanmadan
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
      return NextResponse.json(
        { error: 'Sezon fiyat ID\'si gereklidir' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('SeasonalPrice')
      .select(`
        *,
        currency:currencyId (
          id, code, name, symbol
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Sezon fiyatı bulunamadı' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Sezon fiyatı alınırken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    // Tutarlı API yanıtı sağlamak için { data: ... } formatında döndür
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Sezon fiyatı detayı API hatası:', error);
    return NextResponse.json(
      { error: 'Sezon fiyatı alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PATCH - Sezon fiyatı güncelle
export async function PATCH(request: NextRequest) {
  try {
    // URL'den ID'yi al, parametre kullanmadan
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    const updates: UpdateSeasonalPriceDto = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Sezon fiyat ID\'si gereklidir' },
        { status: 400 }
      );
    }

    // Önce sezon fiyatının var olup olmadığını kontrol et
    const supabase = await createClient();
    const { error: checkError } = await supabase
      .from('SeasonalPrice')
      .select('id, villaId')
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Sezon fiyatı bulunamadı' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Sezon fiyatı kontrol edilirken bir hata oluştu', details: checkError.message },
        { status: 500 }
      );
    }

    // Geçerli bir tarih aralığı kontrolü (eğer her iki tarih de güncellendiyse)
    if (updates.startDate && updates.endDate) {
      if (new Date(updates.startDate) >= new Date(updates.endDate)) {
        return NextResponse.json(
          { error: 'Başlangıç tarihi bitiş tarihinden önce olmalıdır' },
          { status: 400 }
        );
      }
    } else if (updates.startDate) {
      // Sadece başlangıç tarihi güncellendiyse, mevcut bitiş tarihini kontrol et
      const { data: currentEndDate, error: endDateError } = await supabase
        .from('SeasonalPrice')
        .select('endDate')
        .eq('id', id)
        .single();
        
      if (!endDateError && currentEndDate && new Date(updates.startDate) >= new Date(currentEndDate.endDate)) {
        return NextResponse.json(
          { error: 'Başlangıç tarihi bitiş tarihinden önce olmalıdır' },
          { status: 400 }
        );
      }
    } else if (updates.endDate) {
      // Sadece bitiş tarihi güncellendiyse, mevcut başlangıç tarihini kontrol et
      const { data: currentStartDate, error: startDateError } = await supabase
        .from('SeasonalPrice')
        .select('startDate')
        .eq('id', id)
        .single();
        
      if (!startDateError && currentStartDate && new Date(currentStartDate.startDate) >= new Date(updates.endDate)) {
        return NextResponse.json(
          { error: 'Başlangıç tarihi bitiş tarihinden önce olmalıdır' },
          { status: 400 }
        );
      }
    }

    // Gecelik fiyat kontrolü
    if (updates.nightlyPrice !== undefined && updates.nightlyPrice <= 0) {
      return NextResponse.json(
        { error: 'Gecelik fiyat sıfırdan büyük olmalıdır' },
        { status: 400 }
      );
    }

    // Güncelleme işlemi
    const { data, error } = await supabase
      .from('SeasonalPrice')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        currency:currencyId (
          id, code, name, symbol
        )
      `)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Sezon fiyatı güncellenirken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    // Tutarlı API yanıtı sağlamak için { data: ... } formatında döndür
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Sezon fiyatı güncelleme API hatası:', error);
    return NextResponse.json(
      { error: 'Sezon fiyatı güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Sezon fiyatı sil
export async function DELETE(request: NextRequest) {
  try {
    // URL'den ID'yi al, parametre kullanmadan
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
      return NextResponse.json(
        { error: 'Sezon fiyat ID\'si gereklidir' },
        { status: 400 }
      );
    }

    // Önce sezon fiyatının var olup olmadığını kontrol et
    const supabase = await createClient();
    const { data: existingPrice, error: checkError } = await supabase
      .from('SeasonalPrice')
      .select('id, villaId, seasonName')
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Sezon fiyatı bulunamadı' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Sezon fiyatı kontrol edilirken bir hata oluştu', details: checkError.message },
        { status: 500 }
      );
    }

    // Silme işlemi
    const { error } = await supabase
      .from('SeasonalPrice')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Sezon fiyatı silinirken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    // Tutarlı API yanıtı formatı - Response alanı ile döndür
    return NextResponse.json({
      data: {
        id,
        villaId: existingPrice?.villaId,
        seasonName: existingPrice?.seasonName,
        message: 'Sezon fiyatı başarıyla silindi'
      }
    });
  } catch (error) {
    console.error('Sezon fiyatı silme API hatası:', error);
    return NextResponse.json(
      { error: 'Sezon fiyatı silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 