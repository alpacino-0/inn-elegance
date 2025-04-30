'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import type { FilterOption } from '@/types/filter';

/**
 * useTags
 * 
 * Villa etiketlerini (özelliklerini) getiren hook
 * @returns Etiket listesi ve sorgu durumu
 */
export function useTags() {
  return useQuery<FilterOption[], Error>({
    queryKey: ['tags'],
    queryFn: async () => {
      // Önce Tag tablosundan tüm etiketleri çek
      const { data: tags, error: tagsError } = await createClient()
        .from('Tag')
        .select('id, name')
        .order('name', { ascending: true });
      
      if (tagsError) {
        console.error('Etiketler alınırken hata oluştu:', tagsError);
        return [];
      }
      
      // VillaTag tablosundan her etiketin kullanım sayısını çek
      // Şema: public."VillaTag" (id, "villaId", "tagId", "createdAt")
      const { data: villaTags, error: villaTagsError } = await createClient()
        .from('VillaTag')
        .select('tagId'); // Şemaya göre "tagId" sütun adı
      
      if (villaTagsError) {
        console.error('Villa etiketleri alınırken hata oluştu:', villaTagsError);
        return [];
      }
      
      // Etiketlerin kullanım sayısını hesapla
      const tagCountMap = new Map<string, number>();
      
      for (const villaTag of villaTags || []) {
        // Şemaya göre "tagId" sütun adı
        const tagId = villaTag.tagId;
        if (tagId) {
          tagCountMap.set(tagId, (tagCountMap.get(tagId) || 0) + 1);
        }
      }
      
      // FilterOption formatına dönüştür
      const tagOptions: FilterOption[] = (tags || []).map((tag) => ({
        id: tag.id,
        name: tag.name,
        count: tagCountMap.get(tag.id) || 0
      }));
      
      // Kullanım sayısına göre sırala (çok olandan az olana)
      return tagOptions.sort((a, b) => (b.count || 0) - (a.count || 0));
    },
    staleTime: 60 * 1000, // 1 dakika boyunca önbellekte tut
  });
} 