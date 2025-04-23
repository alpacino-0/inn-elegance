import { createClient } from '@/utils/supabase/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// GET - Belirli bir bölgeyi slug'a göre getirir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Bölge slug\'ı gereklidir' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('Region')
      .select('*')
      .eq('slug', slug)
      .eq('isActive', true)
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