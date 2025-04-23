import { createClient } from '@/utils/supabase/server';
import type { Currency, CreateCurrencyDto, UpdateCurrencyDto, CurrencyFilters } from '@/types/currency';

// Tüm para birimlerini getir (filtreli veya filtresiz)
export async function getCurrencies(filters?: CurrencyFilters): Promise<Currency[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('Currency')
    .select('*');
  
  // Filtreleri uygula
  if (filters) {
    if (filters.isActive !== undefined) {
      query = query.eq('isActive', filters.isActive);
    }
    
    if (filters.isDefault !== undefined) {
      query = query.eq('isDefault', filters.isDefault);
    }
    
    if (filters.autoUpdate !== undefined) {
      query = query.eq('autoUpdate', filters.autoUpdate);
    }
    
    if (filters.search) {
      query = query.or(`code.ilike.%${filters.search}%,name.ilike.%${filters.search}%`);
    }
  }
  
  // Sıralama
  query = query.order('isDefault', { ascending: false })
    .order('code', { ascending: true });
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Para birimleri getirilirken hata:', error);
    throw error;
  }
  
  return data as Currency[];
}

// ID'ye göre tek bir para birimi getir
export async function getCurrencyById(id: string): Promise<Currency | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('Currency')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') { // Kayıt bulunamadı
      return null;
    }
    console.error('Para birimi getirilirken hata:', error);
    throw error;
  }
  
  return data as Currency;
}

// Kod'a göre tek bir para birimi getir
export async function getCurrencyByCode(code: string): Promise<Currency | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('Currency')
    .select('*')
    .eq('code', code)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') { // Kayıt bulunamadı
      return null;
    }
    console.error('Para birimi getirilirken hata:', error);
    throw error;
  }
  
  return data as Currency;
}

// Varsayılan para birimini getir
export async function getDefaultCurrency(): Promise<Currency | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('Currency')
    .select('*')
    .eq('isDefault', true)
    .eq('isActive', true)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') { // Kayıt bulunamadı
      return null;
    }
    console.error('Varsayılan para birimi getirilirken hata:', error);
    throw error;
  }
  
  return data as Currency;
}

// Yeni para birimi oluştur
export async function createCurrency(currencyData: CreateCurrencyDto): Promise<Currency> {
  const supabase = await createClient();
  
  // Eğer yeni para birimi varsayılan olarak işaretlendiyse, diğerlerini varsayılan olmaktan çıkar
  if (currencyData.isDefault) {
    await supabase
      .from('Currency')
      .update({ isDefault: false })
      .eq('isDefault', true);
  }
  
  const { data, error } = await supabase
    .from('Currency')
    .insert([currencyData])
    .select('*')
    .single();
  
  if (error) {
    console.error('Para birimi oluşturulurken hata:', error);
    throw error;
  }
  
  return data as Currency;
}

// Para birimi güncelleme
export async function updateCurrency(id: string, updates: UpdateCurrencyDto): Promise<Currency> {
  const supabase = await createClient();
  
  // Eğer para birimi varsayılan olarak işaretlendiyse, diğerlerini varsayılan olmaktan çıkar
  if (updates.isDefault) {
    await supabase
      .from('Currency')
      .update({ isDefault: false })
      .neq('id', id)
      .eq('isDefault', true);
  }
  
  const { data, error } = await supabase
    .from('Currency')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) {
    console.error('Para birimi güncellenirken hata:', error);
    throw error;
  }
  
  return data as Currency;
}

// Para birimi silme
export async function deleteCurrency(id: string): Promise<{ id: string; message: string }> {
  const supabase = await createClient();
  
  // Önce bu para biriminin hiçbir fiyatlandırmada kullanılmadığını kontrol et
  const { count, error: countError } = await supabase
    .from('SeasonalPrice')
    .select('*', { count: 'exact', head: true })
    .eq('currencyId', id);
  
  if (countError) {
    console.error('Para birimi kullanımı kontrol edilirken hata:', countError);
    throw countError;
  }
  
  if (count && count > 0) {
    throw new Error('Bu para birimi fiyatlandırmalarda kullanıldığı için silinemez.');
  }
  
  // Varsayılan para birimi silinemez
  const currency = await getCurrencyById(id);
  if (currency?.isDefault) {
    throw new Error('Varsayılan para birimi silinemez.');
  }
  
  const { error } = await supabase
    .from('Currency')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Para birimi silinirken hata:', error);
    throw error;
  }
  
  return { id, message: 'Para birimi başarıyla silindi.' };
}

// Para birimini devre dışı bırak (soft delete)
export async function deactivateCurrency(id: string): Promise<Currency> {
  const supabase = await createClient();
  
  // Varsayılan para birimi deaktif edilemez
  const currency = await getCurrencyById(id);
  if (currency?.isDefault) {
    throw new Error('Varsayılan para birimi devre dışı bırakılamaz.');
  }
  
  const { data, error } = await supabase
    .from('Currency')
    .update({ isActive: false })
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) {
    console.error('Para birimi devre dışı bırakılırken hata:', error);
    throw error;
  }
  
  return data as Currency;
} 