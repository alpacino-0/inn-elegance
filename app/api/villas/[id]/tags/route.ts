import { createClient } from '@/utils/supabase/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getTagsByIds } from '@/app/api/tags/utils';

// API rotası için segment config
export const dynamic = 'force-dynamic';

// GET - Villanın tüm etiketlerini getir
export async function GET(request: NextRequest) {
  try {
    // URL'den ID'yi al, parametre kullanmadan
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const villaId = pathSegments[pathSegments.length - 2]; // tags'ten önceki segment

    if (!villaId) {
      return NextResponse.json(
        { error: 'Villa ID belirtilmedi' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Önce VillaTag tablosundan villa ile ilişkili tag ID'lerini al
    const { data: villaTags, error: villaTagError } = await supabase
      .from('VillaTag')
      .select('tagId')
      .eq('villaId', villaId);

    if (villaTagError) {
      return NextResponse.json(
        { error: 'Villa etiketleri alınırken bir hata oluştu', details: villaTagError.message },
        { status: 500 }
      );
    }

    // Villa için hiç etiket yoksa boş bir dizi döndür
    if (!villaTags || villaTags.length === 0) {
      return NextResponse.json([]);
    }

    // Etiket ID'lerini bir diziye dönüştür
    const tagIds = villaTags.map(vt => vt.tagId);

    // Etiket detaylarını al
    const { data: tags, error: tagsError } = await getTagsByIds(tagIds);

    if (tagsError) {
      return NextResponse.json(
        { error: 'Etiket detayları alınırken bir hata oluştu', details: tagsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(tags || []);
  } catch (error) {
    console.error('Villa etiketleri API hatası:', error);
    return NextResponse.json(
      { error: 'Villa etiketleri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Villaya etiket ekle
export async function POST(request: NextRequest) {
  try {
    // URL'den ID'yi al, parametre kullanmadan
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const villaId = pathSegments[pathSegments.length - 2]; // tags'ten önceki segment
    
    if (!villaId) {
      return NextResponse.json(
        { error: 'Villa ID belirtilmedi' },
        { status: 400 }
      );
    }

    // İstek gövdesinden tagId'yi al
    const body = await request.json();
    const { tagId } = body;

    if (!tagId) {
      return NextResponse.json(
        { error: 'Tag ID belirtilmedi' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Villa varlığını kontrol et
    const { data: villa, error: villaError } = await supabase
      .from('Villa')
      .select('id')
      .eq('id', villaId)
      .single();

    if (villaError || !villa) {
      return NextResponse.json(
        { error: 'Villa bulunamadı', details: villaError?.message },
        { status: 404 }
      );
    }

    // Tag varlığını kontrol et
    const { data: tag, error: tagError } = await supabase
      .from('Tag')
      .select('id')
      .eq('id', tagId)
      .single();

    if (tagError || !tag) {
      return NextResponse.json(
        { error: 'Etiket bulunamadı', details: tagError?.message },
        { status: 404 }
      );
    }

    // İlişki zaten var mı kontrol et
    const { data: existingRelation, error: relationCheckError } = await supabase
      .from('VillaTag')
      .select('*')
      .eq('villaId', villaId)
      .eq('tagId', tagId)
      .maybeSingle();

    if (relationCheckError) {
      return NextResponse.json(
        { error: 'İlişki kontrolü sırasında bir hata oluştu', details: relationCheckError.message },
        { status: 500 }
      );
    }

    if (existingRelation) {
      return NextResponse.json(
        { error: 'Bu etiket zaten bu villaya eklenmiş' },
        { status: 409 } // Conflict
      );
    }

    // VillaTag ilişkisini ekle
    const { data, error } = await supabase
      .from('VillaTag')
      .insert([{ villaId, tagId }])
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Villaya etiket eklenirken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }

    // Başarılı yanıt
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Villa etiket ekleme API hatası:', error);
    return NextResponse.json(
      { error: 'Villaya etiket eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 