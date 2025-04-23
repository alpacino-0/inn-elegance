import { NextRequest, NextResponse } from 'next/server';
import { getCurrencyByCode, getDefaultCurrency } from '../utils';

// GET /api/currencies/convert - Para birimi dönüşümü
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parametreleri al
    const amountParam = searchParams.get('amount');
    const fromCurrency = searchParams.get('from')?.toUpperCase();
    const toCurrency = searchParams.get('to')?.toUpperCase();
    
    // Parametreleri kontrol et
    if (!amountParam || isNaN(parseFloat(amountParam))) {
      return NextResponse.json(
        { error: 'Geçerli bir miktar belirtilmelidir' },
        { status: 400 }
      );
    }
    
    if (!fromCurrency || !toCurrency) {
      return NextResponse.json(
        { error: 'Kaynak ve hedef para birimi belirtilmelidir' },
        { status: 400 }
      );
    }
    
    // Miktarı sayıya çevir
    const amount = parseFloat(amountParam);
    
    // Para birimlerini getir
    const sourceCurrency = await getCurrencyByCode(fromCurrency);
    const targetCurrency = await getCurrencyByCode(toCurrency);
    
    if (!sourceCurrency) {
      return NextResponse.json(
        { error: `'${fromCurrency}' para birimi bulunamadı` },
        { status: 404 }
      );
    }
    
    if (!targetCurrency) {
      return NextResponse.json(
        { error: `'${toCurrency}' para birimi bulunamadı` },
        { status: 404 }
      );
    }
    
    // Aynı para birimi ise direkt olarak miktarı döndür
    if (fromCurrency === toCurrency) {
      return NextResponse.json({
        amount,
        fromCurrency,
        toCurrency,
        result: amount
      });
    }
    
    // Varsayılan para birimi üzerinden dönüşüm yap
    // 1. Her iki para birimi de varsayılan değilse, varsayılan para birimini getir
    // 2. fromCurrency -> varsayılan -> toCurrency şeklinde iki adımlı dönüşüm yap
    let result: number;
    
    if (!sourceCurrency.isDefault && !targetCurrency.isDefault) {
      const defaultCurrency = await getDefaultCurrency();
      
      if (!defaultCurrency) {
        return NextResponse.json(
          { error: 'Varsayılan para birimi bulunamadı' },
          { status: 500 }
        );
      }
      
      // İlk önce kaynak para biriminden varsayılan para birimine dönüştür
      const amountInDefault = amount * (1 / sourceCurrency.exchangeRate);
      
      // Sonra varsayılan para biriminden hedef para birimine dönüştür
      result = amountInDefault * targetCurrency.exchangeRate;
    } else if (sourceCurrency.isDefault) {
      // Kaynak para birimi varsayılan ise, doğrudan hedef kuru ile çarp
      result = amount * targetCurrency.exchangeRate;
    } else {
      // Hedef para birimi varsayılan ise, kaynak kurun tersini kullan
      result = amount * (1 / sourceCurrency.exchangeRate);
    }
    
    // Sonucu döndür (2 ondalık basamağa yuvarla)
    return NextResponse.json({
      amount,
      fromCurrency,
      toCurrency,
      result: parseFloat(result.toFixed(2))
    });
  } catch (error) {
    console.error('Para birimi dönüşümünde hata:', error);
    return NextResponse.json(
      { error: 'Para birimi dönüşümünde bir hata oluştu' },
      { status: 500 }
    );
  }
} 