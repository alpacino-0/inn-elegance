import { NextResponse } from 'next/server';
import { getDefaultCurrency } from '../utils';

// GET /api/currencies/default - Varsayılan para birimini getir
export async function GET() {
  try {
    const currency = await getDefaultCurrency();
    
    if (!currency) {
      return NextResponse.json(
        { error: 'Varsayılan para birimi bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(currency);
  } catch (error) {
    console.error('Varsayılan para birimi getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Varsayılan para birimi alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 