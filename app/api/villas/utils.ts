import { createClient } from '@/utils/supabase/server';
import type { PostgrestError } from '@supabase/supabase-js';
import type { Villa } from '@/types/villa';

// API sonuç tipleri
export interface VillaResult {
  data: Villa | null;
  error: PostgrestError | null;
}

export interface VillasListResult {
  data: Villa[] | null;
  error: PostgrestError | null;
}

// Yardımcı fonksiyonlar

// Slug ile villa detayını getir
export async function getVillaBySlug(slug: string): Promise<VillaResult> {
  const supabase = await createClient();
  
  return supabase
    .from('Villa')
    .select('*, User!managerId(id, name, email)')
    .eq('slug', slug)
    .single();
}

// ID ile villa detayını getir
export async function getVillaById(id: string): Promise<VillaResult> {
  const supabase = await createClient();
  
  return supabase
    .from('Villa')
    .select('*, User!managerId(id, name, email)')
    .eq('id', id)
    .single();
}

// Filtrelere göre villaları listele
export async function getVillas(
  filters?: {
    status?: string;
    regionId?: string;
    subRegionId?: string;
    managerId?: string;
    minBedrooms?: number;
    minBathrooms?: number;
    minGuests?: number;
    isPromoted?: boolean;
    searchQuery?: string;
    tags?: string[];
  },
  pagination?: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<{
  data: Villa[] | null;
  error: PostgrestError | null;
  count: number | null;
}> {
  const supabase = await createClient();
  
  let query = supabase
    .from('Villa')
    .select('*, User!managerId(id, name, email)', { count: 'exact' });
  
  // Filtreleri uygula
  if (filters) {
    if (filters.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }
    
    if (filters.regionId) {
      query = query.eq('regionId', filters.regionId);
    }
    
    if (filters.subRegionId) {
      query = query.eq('subRegionId', filters.subRegionId);
    }
    
    if (filters.managerId) {
      query = query.eq('managerId', filters.managerId);
    }
    
    if (filters.minBedrooms) {
      query = query.gte('bedrooms', filters.minBedrooms);
    }
    
    if (filters.minBathrooms) {
      query = query.gte('bathrooms', filters.minBathrooms);
    }
    
    if (filters.minGuests) {
      query = query.gte('maxGuests', filters.minGuests);
    }
    
    if (filters.isPromoted) {
      query = query.eq('isPromoted', true);
    }
    
    if (filters.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }
  }
  
  // Sayfalama ve sıralama
  if (pagination) {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const offset = (page - 1) * limit;
    
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + limit - 1);
  }
  
  const { data, error, count } = await query;
  
  return { data, error, count };
} 