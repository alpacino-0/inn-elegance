import { NextRequest, NextResponse } from 'next/server';
import {
  getCurrencies,
  getCurrencyByCode,
  createCurrency
} from './utils';
import type { CreateCurrencyDto } from '@/types/currency';

// GET /api/currencies - Tüm para birimlerini getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filtre parametrelerini topla
    const filters = {
      isActive: searchParams.has('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      isDefault: searchParams.has('isDefault') ? searchParams.get('isDefault') === 'true' : undefined,
      autoUpdate: searchParams.has('autoUpdate') ? searchParams.get('autoUpdate') === 'true' : undefined,
      search: searchParams.get('search') || undefined
    };
    
    const currencies = await getCurrencies(filters);
    return NextResponse.json(currencies);
  } catch (error) {
    console.error('Para birimleri getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Para birimleri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/currencies - Yeni para birimi ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Gelen veriyi doğrula
    if (!body.code || !body.name || !body.symbol) {
      return NextResponse.json(
        { error: 'Kod, ad ve sembol gereklidir' },
        { status: 400 }
      );
    }
    
    // Kod 3 karakter sınırlaması
    if (body.code.length > 3) {
      return NextResponse.json(
        { error: 'Para birimi kodu en fazla 3 karakter olabilir' },
        { status: 400 }
      );
    }
    
    // Kodu büyük harfe çevir
    body.code = body.code.toUpperCase();
    
    // Exchange rate sayısal değer olmalı
    if (isNaN(parseFloat(body.exchangeRate))) {
      return NextResponse.json(
        { error: 'Kur değeri sayısal olmalıdır' },
        { status: 400 }
      );
    }
    
    // Sayısal değerleri doğru tipe dönüştür
    const currencyData: CreateCurrencyDto = {
      code: body.code,
      name: body.name,
      symbol: body.symbol,
      exchangeRate: parseFloat(body.exchangeRate) || 0,
      isDefault: !!body.isDefault,
      isActive: body.isActive !== false, // Varsayılan olarak aktif
      autoUpdate: body.autoUpdate !== false, // Varsayılan olarak otomatik güncelleme açık
      updateInterval: parseInt(body.updateInterval) || 60 // Varsayılan: 60 dakika
    };
    
    // Eklemeden önce kod çakışması kontrolü yap
    const existingCurrency = await getCurrencyByCode(currencyData.code);
    if (existingCurrency) {
      return NextResponse.json(
        { error: `'${currencyData.code}' koduna sahip para birimi zaten mevcut` },
        { status: 409 }
      );
    }
    
    const newCurrency = await createCurrency(currencyData);
    return NextResponse.json(newCurrency, { status: 201 });
  } catch (error) {
    console.error('Para birimi eklenirken hata:', error);
    return NextResponse.json(
      { error: 'Para birimi eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 