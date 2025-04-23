import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { UpdateVillaDto } from '@/types/villa';
import type { PostgrestError } from '@supabase/supabase-js';

// API rotası için segment config
export const dynamic = 'force-dynamic';

// GET - ID'ye göre villa detayı getir
export async function GET(request: NextRequest) {
  try {
    // URL'den ID'yi al, parametre kullanmadan
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
      return NextResponse.json(
        { error: 'Villa ID\'si gereklidir' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('Villa')
      .select('*, User!managerId(id, name, email)')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Villa bulunamadı' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Villa alınırken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }
    
    if (!data) {
      return NextResponse.json(
        { error: 'Villa bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Villa detay API hatası:', error);
    return NextResponse.json(
      { error: 'Villa alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PATCH - Villayı güncelle
export async function PATCH(request: NextRequest) {
  try {
    // URL'den ID'yi al, parametre kullanmadan
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    const updates: UpdateVillaDto = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Villa ID\'si gereklidir' },
        { status: 400 }
      );
    }
    
    // Villa'nın mevcut olduğunu kontrol et
    const supabase = await createClient();
    const { data: existingVilla, error: checkError } = await supabase
      .from('Villa')
      .select('id, slug')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Villa bulunamadı' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Villa kontrol edilirken bir hata oluştu', details: checkError.message },
        { status: 500 }
      );
    }
    
    if (!existingVilla) {
      return NextResponse.json(
        { error: 'Villa bulunamadı' },
        { status: 404 }
      );
    }
    
    // Slug değiştirilmişse benzersiz olduğunu kontrol et
    if (updates.slug && updates.slug !== existingVilla.slug) {
      const { data: slugCheck, error: slugCheckError } = await supabase
        .from('Villa')
        .select('id')
        .eq('slug', updates.slug)
        .neq('id', id)
        .maybeSingle();
      
      if (slugCheckError) {
        return NextResponse.json(
          { error: 'Slug kontrolü sırasında bir hata oluştu', details: slugCheckError.message },
          { status: 500 }
        );
      }
      
      if (slugCheck) {
        return NextResponse.json(
          { error: 'Bu slug zaten kullanılıyor' },
          { status: 400 }
        );
      }
    }
    
    // Bölge değiştirilirse yeni bölge bilgilerini al
    if (updates.regionId) {
      const { data: region, error: regionError } = await supabase
        .from('Region')
        .select('name')
        .eq('id', updates.regionId)
        .single();
      
      if (regionError || !region) {
        return NextResponse.json(
          { error: 'Belirtilen bölge bulunamadı' },
          { status: 400 }
        );
      }
      
      updates.mainRegion = region.name;
    }
    
    // Alt bölge değiştirilirse yeni alt bölge bilgilerini al
    if (updates.subRegionId) {
      const { data: subRegion, error: subRegionError } = await supabase
        .from('Region')
        .select('name')
        .eq('id', updates.subRegionId)
        .single();
      
      if (subRegionError || !subRegion) {
        return NextResponse.json(
          { error: 'Belirtilen alt bölge bulunamadı' },
          { status: 400 }
        );
      }
      
      updates.subRegion = subRegion.name;
    }
    
    // Yönetici değiştirilirse kontrol et
    if (updates.managerId) {
      const { data: manager, error: managerError } = await supabase
        .from('User')
        .select('id')
        .eq('id', updates.managerId)
        .single();
      
      if (managerError || !manager) {
        return NextResponse.json(
          { error: 'Belirtilen yönetici bulunamadı' },
          { status: 400 }
        );
      }
    }
    
    // Güncellemeleri uygula ve son durumu döndür
    const { data, error } = await supabase
      .from('Villa')
      .update({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select('*, User!managerId(id, name, email)')
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Villa güncellenirken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Villa güncelleme API hatası:', error);
    return NextResponse.json(
      { error: 'Villa güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Villayı sil
export async function DELETE(request: NextRequest) {
  try {
    // URL'den ID'yi al, parametre kullanmadan
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    const { searchParams } = new URL(request.url);
    const softDelete = searchParams.get('soft') === 'true';
    
    if (!id) {
      return NextResponse.json(
        { error: 'Villa ID\'si gereklidir' },
        { status: 400 }
      );
    }
    
    // Villanın var olduğunu kontrol et
    const supabase = await createClient();
    const { data: villa, error: checkError } = await supabase
      .from('Villa')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Villa bulunamadı' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Villa kontrol edilirken bir hata oluştu', details: checkError.message },
        { status: 500 }
      );
    }
    
    if (!villa) {
      return NextResponse.json(
        { error: 'Villa bulunamadı' },
        { status: 404 }
      );
    }
    
    let error: PostgrestError | null = null;
    
    // Soft delete mi, hard delete mi?
    if (softDelete) {
      // Sadece durumu INACTIVE olarak güncelle
      const { error: updateError } = await supabase
        .from('Villa')
        .update({
          status: 'INACTIVE',
          updatedAt: new Date().toISOString()
        })
        .eq('id', id);
      
      error = updateError;
    } else {
      // Hard delete işlemi
      const { error: deleteError } = await supabase
        .from('Villa')
        .delete()
        .eq('id', id);
      
      error = deleteError;
    }
    
    if (error) {
      return NextResponse.json(
        { error: 'Villa silinirken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: softDelete ? 'Villa başarıyla devre dışı bırakıldı' : 'Villa başarıyla silindi',
      id
    });
  } catch (error) {
    console.error('Villa silme API hatası:', error);
    return NextResponse.json(
      { error: 'Villa silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 