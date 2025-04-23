import { createClient } from '@/utils/supabase/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { PostgrestError } from '@supabase/supabase-js';

// GET - Belirli bir bölgeyi ID'ye göre getirir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Bölge ID\'si gereklidir' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('Region')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Bölge alınırken bir hata oluştu', details: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Bölge bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Bölge detay API hatası:', error);
    return NextResponse.json(
      { error: 'Bölge alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PATCH - Belirli bir bölgeyi günceller
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const updateData = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Bölge ID\'si gereklidir' },
        { status: 400 }
      );
    }

    // Ana bölge ise parentId temizleniyor
    if (updateData.isMainRegion) {
      updateData.parentId = null;
    }

    // Slug güncellemesi (eğer isim değiştiyse ve slug girilmediyse)
    if (updateData.name && !updateData.slug) {
      updateData.slug = updateData.name
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

    // Güncelleme zamanını ekle
    updateData.updatedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from('Region')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Bölge güncellenirken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Bölge güncelleme API hatası:', error);
    return NextResponse.json(
      { error: 'Bölge güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Belirli bir bölgeyi siler veya deaktif eder
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const softDelete = searchParams.get('soft') === 'true';

    if (!id) {
      return NextResponse.json(
        { error: 'Bölge ID\'si gereklidir' },
        { status: 400 }
      );
    }

    interface SupabaseResult {
      error: PostgrestError | null;
      data: unknown;
    }
    
    let result: SupabaseResult | null = null;

    if (softDelete) {
      // Soft delete - isActive = false olarak işaretle
      result = await supabase
        .from('Region')
        .update({ isActive: false, updatedAt: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    } else {
      // Hard delete - kaydı tamamen sil
      result = await supabase
        .from('Region')
        .delete()
        .eq('id', id)
        .select()
        .single();
    }

    const { error } = result;

    if (error) {
      return NextResponse.json(
        { 
          error: 'Bölge silinirken bir hata oluştu', 
          details: error.message,
          softDelete 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: softDelete ? 'Bölge deaktif edildi' : 'Bölge silindi',
      id 
    });
  } catch (error) {
    console.error('Bölge silme API hatası:', error);
    return NextResponse.json(
      { error: 'Bölge silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 