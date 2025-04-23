import { NextRequest, NextResponse } from 'next/server';
import {
  getCurrencyById,
  updateCurrency,
  deleteCurrency,
  deactivateCurrency
} from '../utils';
import type { UpdateCurrencyDto } from '@/types/currency';

// GET /api/currencies/[id] - Belirli bir para birimini getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const currency = await getCurrencyById(id);
    
    if (!currency) {
      return NextResponse.json(
        { error: 'Para birimi bulunamadı' },
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

// PATCH /api/currencies/[id] - Para birimi güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const currency = await getCurrencyById(id);
    if (!currency) {
      return NextResponse.json(
        { error: 'Para birimi bulunamadı' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Güncelleme verilerini hazırla
    const updates: UpdateCurrencyDto = {};
    
    // Sadece gönderilen alanları güncelle
    if (body.name !== undefined) updates.name = body.name;
    if (body.symbol !== undefined) updates.symbol = body.symbol;
    if (body.exchangeRate !== undefined) {
      if (isNaN(parseFloat(body.exchangeRate))) {
        return NextResponse.json(
          { error: 'Kur değeri sayısal olmalıdır' },
          { status: 400 }
        );
      }
      updates.exchangeRate = parseFloat(body.exchangeRate);
    }
    if (body.isDefault !== undefined) updates.isDefault = !!body.isDefault;
    if (body.isActive !== undefined) updates.isActive = !!body.isActive;
    if (body.autoUpdate !== undefined) updates.autoUpdate = !!body.autoUpdate;
    if (body.updateInterval !== undefined) {
      updates.updateInterval = parseInt(body.updateInterval) || 60;
    }
    
    // Eğer hiçbir alan gönderilmediyse, güncelleme yapmaya gerek yok
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(currency); // Mevcut para birimini döndür
    }
    
    // Para birimini güncelle
    const updatedCurrency = await updateCurrency(id, updates);
    return NextResponse.json(updatedCurrency);
  } catch (error) {
    console.error('Para birimi güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Para birimi güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE /api/currencies/[id] - Para birimi sil veya deaktif et
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const isSoftDelete = searchParams.get('soft') === 'true';
    
    if (isSoftDelete) {
      // Soft delete (deaktif et)
      const deactivatedCurrency = await deactivateCurrency(id);
      return NextResponse.json({
        message: 'Para birimi başarıyla devre dışı bırakıldı',
        id: id,
        currency: deactivatedCurrency
      });
    } else {
      // Hard delete
      const result = await deleteCurrency(id);
      return NextResponse.json(result);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    
    if (errorMessage.includes('silinemez')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }
    
    console.error('Para birimi silinirken hata:', error);
    return NextResponse.json(
      { error: 'Para birimi silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 