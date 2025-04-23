import { createClient } from '@/utils/supabase/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { PostgrestError } from '@supabase/supabase-js';

// GET - Belirli bir etiketi ID'ye göre getirir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Etiket ID\'si gereklidir' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('Tag')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Etiket alınırken bir hata oluştu', details: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Etiket bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Etiket detay API hatası:', error);
    return NextResponse.json(
      { error: 'Etiket alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PATCH - Etiket adını günceller
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
        { error: 'Etiket ID\'si gereklidir' },
        { status: 400 }
      );
    }

    // İstek verilerini doğrulama
    if (!updateData.name || typeof updateData.name !== 'string' || updateData.name.trim() === '') {
      return NextResponse.json(
        { error: 'Geçerli bir etiket adı gereklidir' },
        { status: 400 }
      );
    }

    // Etiket adını temizleme
    updateData.name = updateData.name.trim();
    
    // Aynı isimde başka bir etiket var mı kontrol etme
    const { data: existingTag } = await supabase
      .from('Tag')
      .select('id')
      .eq('name', updateData.name)
      .neq('id', id) // Bu ID'ye sahip olanı hariç tut
      .maybeSingle();
    
    if (existingTag) {
      return NextResponse.json(
        { error: 'Bu isimde bir etiket zaten mevcut', existingId: existingTag.id },
        { status: 409 } // Conflict
      );
    }

    // Güncellenme zamanını otomatik olarak PostgreSQL trigger ile yapacağız

    const { data, error } = await supabase
      .from('Tag')
      .update({ name: updateData.name })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      const errorMessage = error.code === '23505' 
        ? 'Bu isimde bir etiket zaten mevcut'
        : 'Etiket güncellenirken bir hata oluştu';
      
      return NextResponse.json(
        { error: errorMessage, details: error.message },
        { status: error.code === '23505' ? 409 : 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Etiket güncelleme API hatası:', error);
    return NextResponse.json(
      { error: 'Etiket güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Etiketi siler
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Etiket ID\'si gereklidir' },
        { status: 400 }
      );
    }

    interface SupabaseResult {
      error: PostgrestError | null;
      data: unknown;
    }
    
    // Hard delete - kaydı tamamen sil
    const result: SupabaseResult = await supabase
      .from('Tag')
      .delete()
      .eq('id', id)
      .select()
      .single();

    const { error } = result;

    if (error) {
      // Eğer foreign key constraint hatası olursa (tag kullanılıyorsa)
      if (error.code === '23503') {
        return NextResponse.json(
          { 
            error: 'Bu etiket kullanımda olduğu için silinemez', 
            details: error.message,
          },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Etiket silinirken bir hata oluştu', 
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Etiket başarıyla silindi',
      id 
    });
  } catch (error) {
    console.error('Etiket silme API hatası:', error);
    return NextResponse.json(
      { error: 'Etiket silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 