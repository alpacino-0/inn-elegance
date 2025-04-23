import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAmenityById, updateAmenity, deleteAmenity } from '../utils';

// GET - Belirli bir villa olanağını ID'ye göre getir
export async function GET(request: NextRequest) {
  try {
    // URL'den ID'yi al, parametre kullanmadan
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
      return NextResponse.json(
        { error: 'Olanak ID\'si gereklidir' },
        { status: 400 }
      );
    }

    const { data, error } = await getAmenityById(id);

    if (error) {
      return NextResponse.json(
        { error: 'Olanak alınırken bir hata oluştu', details: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Olanak bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Olanak detay API hatası:', error);
    return NextResponse.json(
      { error: 'Olanak alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// PATCH - Belirli bir villa olanağını güncelle
export async function PATCH(request: NextRequest) {
  try {
    // URL'den ID'yi al, parametre kullanmadan
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    const updateData = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Olanak ID\'si gereklidir' },
        { status: 400 }
      );
    }

    // Güncelleme verisini doğrula
    if (!updateData.name && !updateData.icon) {
      return NextResponse.json(
        { error: 'Güncellenecek en az bir alan gereklidir (name veya icon)' },
        { status: 400 }
      );
    }

    // Güncellenebilecek alanları topla
    const updates: { name?: string; icon?: string | null } = {};
    
    if (updateData.name !== undefined) {
      if (typeof updateData.name !== 'string' || updateData.name.trim() === '') {
        return NextResponse.json(
          { error: 'Olanak adı geçerli bir metin olmalıdır' },
          { status: 400 }
        );
      }
      updates.name = updateData.name.trim();
    }
    
    if (updateData.icon !== undefined) {
      updates.icon = updateData.icon === null ? null : String(updateData.icon);
    }

    const { data, error } = await updateAmenity(id, updates);

    if (error) {
      return NextResponse.json(
        { error: 'Olanak güncellenirken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Olanak güncelleme API hatası:', error);
    return NextResponse.json(
      { error: 'Olanak güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Belirli bir villa olanağını sil
export async function DELETE(request: NextRequest) {
  try {
    // URL'den ID'yi al, parametre kullanmadan
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    if (!id) {
      return NextResponse.json(
        { error: 'Olanak ID\'si gereklidir' },
        { status: 400 }
      );
    }

    // Önce olanağın var olup olmadığını kontrol et
    const { data: existingAmenity, error: checkError } = await getAmenityById(id);
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Olanak bulunamadı' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Olanak kontrol edilirken bir hata oluştu', details: checkError.message },
        { status: 500 }
      );
    }
    
    if (!existingAmenity) {
      return NextResponse.json(
        { error: 'Olanak bulunamadı' },
        { status: 404 }
      );
    }
    
    // Olanağı sil
    const { error } = await deleteAmenity(id);

    if (error) {
      return NextResponse.json(
        { error: 'Olanak silinirken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Olanak başarıyla silindi',
      id,
      villaId: existingAmenity.villaId // Villa ID'sini de döndür
    });
  } catch (error) {
    console.error('Olanak silme API hatası:', error);
    return NextResponse.json(
      { error: 'Olanak silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 