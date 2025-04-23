import { createClient } from '@/utils/supabase/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// DELETE - Villadan etiketi kaldır
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  try {
    const { id: villaId, tagId } = await params;

    if (!villaId || !tagId) {
      return NextResponse.json(
        { error: 'Villa ID ve Tag ID belirtilmelidir' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // İlişkiyi kontrol et
    const { data: relation, error: checkError } = await supabase
      .from('VillaTag')
      .select('*')
      .eq('villaId', villaId)
      .eq('tagId', tagId)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json(
        { error: 'İlişki kontrolü sırasında bir hata oluştu', details: checkError.message },
        { status: 500 }
      );
    }

    if (!relation) {
      return NextResponse.json(
        { error: 'Bu villa ve etiket arasında bir ilişki bulunamadı' },
        { status: 404 }
      );
    }

    // İlişkiyi sil
    const { error: deleteError } = await supabase
      .from('VillaTag')
      .delete()
      .eq('villaId', villaId)
      .eq('tagId', tagId);

    if (deleteError) {
      return NextResponse.json(
        { error: 'İlişki silinirken bir hata oluştu', details: deleteError.message },
        { status: 500 }
      );
    }

    // Başarılı yanıt
    return NextResponse.json(
      { message: 'Etiket villadan başarıyla kaldırıldı', villaId, tagId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Villa etiket silme API hatası:', error);
    return NextResponse.json(
      { error: 'Villadan etiket kaldırılırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 