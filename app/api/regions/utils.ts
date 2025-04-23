import { createClient } from '@/utils/supabase/server';
import type { PostgrestError } from '@supabase/supabase-js';

// Region türü - SupabaseDB'den alınan tüm alanları içerir
export interface Region {
  id: string;
  name: string;
  isMainRegion: boolean;
  parentId: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  imageUrl: string | null;
  isPromoted: boolean;
  slug: string | null;
  villaCount: number | null;
  isActive: boolean;
  metaTitle: string | null;
  metaDesc: string | null;
}

// Bölge sonuç tipi - API yanıtlarında kullanılır
export interface RegionResult {
  data: Region | null;
  error: PostgrestError | null;
}

// Bölge listesi sonuç tipi - API yanıtlarında kullanılır
export interface RegionListResult {
  data: Region[] | null;
  error: PostgrestError | null;
}

// Bölgeler için slug oluşturma işlevi
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Ana bölgeleri getiren yardımcı işlev
export async function getMainRegions(includeInactive = false): Promise<RegionListResult> {
  const supabase = await createClient();
  
  let query = supabase
    .from('Region')
    .select('*')
    .eq('isMainRegion', true)
    .order('name');
  
  if (!includeInactive) {
    query = query.eq('isActive', true);
  }
  
  return query;
}

// Alt bölgeleri getiren yardımcı işlev
export async function getSubRegions(parentId: string, includeInactive = false): Promise<RegionListResult> {
  const supabase = await createClient();
  
  let query = supabase
    .from('Region')
    .select('*')
    .eq('parentId', parentId)
    .order('name');
  
  if (!includeInactive) {
    query = query.eq('isActive', true);
  }
  
  return query;
}

// Öne çıkan bölgeleri getiren yardımcı işlev
export async function getPromotedRegions(limit = 10): Promise<RegionListResult> {
  const supabase = await createClient();
  
  return supabase
    .from('Region')
    .select('*')
    .eq('isPromoted', true)
    .eq('isActive', true)
    .order('name')
    .limit(limit);
}

// ID ile bölge detayını getiren yardımcı işlev
export async function getRegionById(id: string): Promise<RegionResult> {
  const supabase = await createClient();
  
  return supabase
    .from('Region')
    .select('*')
    .eq('id', id)
    .single();
}

// Slug ile bölge detayını getiren yardımcı işlev
export async function getRegionBySlug(slug: string): Promise<RegionResult> {
  const supabase = await createClient();
  
  return supabase
    .from('Region')
    .select('*')
    .eq('slug', slug)
    .eq('isActive', true)
    .single();
} 