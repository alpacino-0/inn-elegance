import { createClient } from '@/utils/supabase/server';
import type { PostgrestError } from '@supabase/supabase-js';

// VillaAmenity veri tipi 
export interface VillaAmenity {
  id: string;
  villaId: string;
  name: string;
  icon: string | null;
  createdAt: string;
}

// API sonuç tipleri
export interface VillaAmenityResult {
  data: VillaAmenity | null;
  error: PostgrestError | null;
}

export interface VillaAmenitiesListResult {
  data: VillaAmenity[] | null;
  error: PostgrestError | null;
}

// Yardımcı fonksiyonlar

// Villa ID'sine göre olanakları getir
export async function getAmenitiesByVillaId(villaId: string): Promise<VillaAmenitiesListResult> {
  const supabase = await createClient();
  
  return supabase
    .from('VillaAmenity')
    .select('*')
    .eq('villaId', villaId)
    .order('name');
}

// ID ile olanak detayı getir
export async function getAmenityById(id: string): Promise<VillaAmenityResult> {
  const supabase = await createClient();
  
  return supabase
    .from('VillaAmenity')
    .select('*')
    .eq('id', id)
    .single();
}

// Yeni olanak ekle
export async function addAmenity(amenityData: Omit<VillaAmenity, 'id' | 'createdAt'>): Promise<VillaAmenityResult> {
  const supabase = await createClient();
  
  return supabase
    .from('VillaAmenity')
    .insert([amenityData])
    .select()
    .single();
}

// Olanak güncelle
export async function updateAmenity(id: string, updates: Partial<Pick<VillaAmenity, 'name' | 'icon'>>): Promise<VillaAmenityResult> {
  const supabase = await createClient();
  
  return supabase
    .from('VillaAmenity')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
}

// Olanak sil
export async function deleteAmenity(id: string): Promise<VillaAmenityResult> {
  const supabase = await createClient();
  
  return supabase
    .from('VillaAmenity')
    .delete()
    .eq('id', id)
    .select()
    .single();
} 