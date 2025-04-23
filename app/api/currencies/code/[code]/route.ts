import { NextRequest, NextResponse } from 'next/server';
import { getCurrencyByCode } from '../../utils';

// GET /api/currencies/code/[code] - Belirli bir para birimi koduna göre para birimini getir
export async function GET(
  _: NextRequest, 
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    // Kodu üst harf formatına çevir (USD, EUR gibi)
    const uppercaseCode = code.toUpperCase();
    
    const currency = await getCurrencyByCode(uppercaseCode);
    
    if (!currency) {
      return NextResponse.json(
        { error: `'${uppercaseCode}' kodlu para birimi bulunamadı` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(currency);
  } catch (error) {
    console.error('Para birimi getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Para birimi alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 