import { createClient } from '@/utils/supabase/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// GET - Tüm etiketleri listeler
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // İsteğe bağlı arama parametresi
    const search = searchParams.get('search');
    
    let query = supabase
      .from('Tag')
      .select('*')
      .order('name');
    
    // Arama filtresi ekleniyor
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: 'Etiketler alınırken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Etiketler API hatası:', error);
    return NextResponse.json(
      { error: 'Etiketler alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Yeni bir etiket ekler
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const tagData = await request.json();
    
    // İstek verilerini doğrulama
    if (!tagData.name || typeof tagData.name !== 'string' || tagData.name.trim() === '') {
      return NextResponse.json(
        { error: 'Geçerli bir etiket adı gereklidir' },
        { status: 400 }
      );
    }
    
    // Etiket adını temizleme
    tagData.name = tagData.name.trim();
    
    // Etiket var mı kontrol etme (unique constraint Supabase tarafında zorunlu)
    const { data: existingTag } = await supabase
      .from('Tag')
      .select('id')
      .eq('name', tagData.name)
      .maybeSingle();
    
    if (existingTag) {
      return NextResponse.json(
        { error: 'Bu isimde bir etiket zaten mevcut', existingId: existingTag.id },
        { status: 409 } // Conflict
      );
    }
    
    const { data, error } = await supabase
      .from('Tag')
      .insert([{ name: tagData.name }])
      .select()
      .single();
    
    if (error) {
      const errorMessage = error.code === '23505' 
        ? 'Bu isimde bir etiket zaten mevcut'
        : 'Etiket eklenirken bir hata oluştu';
      
      return NextResponse.json(
        { error: errorMessage, details: error.message },
        { status: error.code === '23505' ? 409 : 500 }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Etiket ekleme API hatası:', error);
    return NextResponse.json(
      { error: 'Etiket eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 