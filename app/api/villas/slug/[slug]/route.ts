import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getVillaBySlug } from '@/app/api/villas/utils';

// API rotası için segment config
export const dynamic = 'force-dynamic';

// GET - Bir villayı slug'a göre getir
export async function GET(request: NextRequest) {
  try {
    // URL'den slug'ı al, parametre kullanmadan
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const slug = pathSegments[pathSegments.length - 1];

    if (!slug) {
      return NextResponse.json(
        { error: 'Villa slug\'ı gereklidir' },
        { status: 400 }
      );
    }

    const { data, error } = await getVillaBySlug(slug);

    if (error) {
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
    console.error('Villa slug API hatası:', error);
    return NextResponse.json(
      { error: 'Villa alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 