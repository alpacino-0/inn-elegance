import { createClient } from '@/utils/supabase/server';
import type { PostgrestError } from '@supabase/supabase-js';

// Tag veri tipi - SupabaseDB'den alınan tüm alanları içerir
export interface Tag {
  id: string;
  name: string;
  createdAt: string | null;
}

// Tag sonuç tipi - API yanıtlarında kullanılır
export interface TagResult {
  data: Tag | null;
  error: PostgrestError | null;
}

// Tag listesi sonuç tipi - API yanıtlarında kullanılır
export interface TagListResult {
  data: Tag[] | null;
  error: PostgrestError | null;
}

// Tüm etiketleri getiren yardımcı işlev
export async function getAllTags(search?: string): Promise<TagListResult> {
  const supabase = await createClient();
  
  let query = supabase
    .from('Tag')
    .select('*')
    .order('name');
  
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  
  return query;
}

// ID ile etiket detayını getiren yardımcı işlev
export async function getTagById(id: string): Promise<TagResult> {
  const supabase = await createClient();
  
  return supabase
    .from('Tag')
    .select('*')
    .eq('id', id)
    .single();
}

// İsimle arama yapan yardımcı işlev
export async function searchTagsByName(name: string, limit = 10): Promise<TagListResult> {
  const supabase = await createClient();
  
  return supabase
    .from('Tag')
    .select('*')
    .ilike('name', `%${name}%`)
    .order('name')
    .limit(limit);
}

// İsim tam eşleşmesiyle etiket arayan yardımcı işlev
export async function findTagByExactName(name: string): Promise<TagResult> {
  const supabase = await createClient();
  
  return supabase
    .from('Tag')
    .select('*')
    .eq('name', name)
    .single();
}

// Birden fazla etiket ID'sine göre getirme
export async function getTagsByIds(ids: string[]): Promise<TagListResult> {
  if (!ids.length) return { data: [], error: null };
  
  const supabase = await createClient();
  
  return supabase
    .from('Tag')
    .select('*')
    .in('id', ids)
    .order('name');
} 