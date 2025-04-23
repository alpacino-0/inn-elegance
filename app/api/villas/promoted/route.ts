import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET - Öne çıkan villaları getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get('limit') || '6', 10);
    
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('Villa')
      .select('*')
      .eq('status', 'ACTIVE')
      .eq('isPromoted', true)
      .order('createdAt', { ascending: false })
      .limit(limit);
    
    if (error) {
      return NextResponse.json(
        { error: 'Öne çıkan villalar alınırken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Öne çıkan villalar API hatası:', error);
    return NextResponse.json(
      { error: 'Öne çıkan villalar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 