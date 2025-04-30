'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import type { VillaFilters } from '@/types/villa';
import { useState, useCallback } from 'react';

// Veritabanı şemasına uygun Region tipini tanımlayalım
interface Region {
  id: string; // UUID tipinde (Supabase'de UUID string olarak döner)
  name: string;
  isMainRegion: boolean;
  parentId: string | null; // Veritabanında null olabilir
  description: string | null;
  createdAt: string; // Timestamp with timezone
  updatedAt: string; // Timestamp with timezone
  imageUrl: string | null;
  isPromoted: boolean;
  slug: string | null;
  villaCount: number | null;
  isActive: boolean;
  metaTitle: string | null;
  metaDesc: string | null;
}

// Bölge seçimi için kullanılan format
interface RegionOption {
  id: string;
  name: string;
  isMainRegion: boolean;
  parentId: string | null;
  description: string | null;
  imageUrl: string | null;
  isPromoted: boolean;
  slug: string | null;
  villaCount: number | null;
  isActive: boolean;
  metaTitle: string | null;
  metaDesc: string | null;
  subRegions: SubRegionOption[];
}

// Alt bölge seçimi için daha basit bir yapı
interface SubRegionOption {
  id: string;
  name: string;
  count: number; // Villa sayısı
}

/**
 * useRegions
 * 
 * Tüm bölgeleri hiyerarşik yapıda getiren hook
 * @returns Bölge listesi ve sorgu durumu
 */
export function useRegions() {
  return useQuery<RegionOption[], Error>({
    queryKey: ['regions'],
    queryFn: async () => {
      const supabase = createClient();
      
      // Ana bölgeleri getir (isMainRegion=true ve isActive=true olanlar)
      const { data: mainRegions, error: mainError } = await supabase
        .from('Region')
        .select('*')
        .eq('isMainRegion', true)
        .eq('isActive', true)
        .order('name', { ascending: true });
      
      if (mainError) {
        console.error('Ana bölgeler alınırken hata oluştu:', mainError);
        return [];
      }

      if (!mainRegions || mainRegions.length === 0) {
        return [];
      }
      
      // Her ana bölge için alt bölgeleri getir
      const regionsWithSubRegions: RegionOption[] = await Promise.all(
        mainRegions.map(async (region: Region) => {
          const { data: subRegions, error: subError } = await supabase
            .from('Region')
            .select('*')
            .eq('parentId', region.id)
            .eq('isActive', true)
            .order('name', { ascending: true });
          
          if (subError) {
            console.error(`${region.name} için alt bölgeler alınırken hata oluştu:`, subError);
            return {
              ...region, // Tüm özellikleri kopyala
              subRegions: [] // Boş alt bölge listesi
            };
          }
          
          return {
            ...region, // Ana bölge verilerini kopyala
            subRegions: (subRegions || []).map((subRegion: Region) => ({
              id: subRegion.id,
              name: subRegion.name,
              count: subRegion.villaCount || 0
            }))
          };
        })
      );
      
      return regionsWithSubRegions;
    },
    staleTime: 60 * 1000, // 1 dakika boyunca önbellekte tut
  });
}

/**
 * useMainRegions
 * 
 * Sadece ana bölgeleri getiren hook
 * @returns Ana bölge listesi ve sorgu durumu
 */
export function useMainRegions() {
  return useQuery<Region[], Error>({
    queryKey: ['mainRegions'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('Region')
        .select('*')
        .eq('isMainRegion', true)
        .eq('isActive', true)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Ana bölgeler alınırken hata oluştu:', error);
        return [];
      }
      
      return data || [];
    },
    staleTime: 60 * 1000, // 1 dakika boyunca önbellekte tut
  });
}

/**
 * useSubRegions
 * 
 * Belirli bir ana bölgeye ait alt bölgeleri getiren hook
 * @param parentId - Ana bölge ID'si
 * @returns Alt bölge listesi ve sorgu durumu
 */
export function useSubRegions(parentId: string | null) {
  return useQuery<Region[], Error>({
    queryKey: ['subRegions', parentId],
    queryFn: async () => {
      if (!parentId) return [];
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('Region')
        .select('*')
        .eq('parentId', parentId)
        .eq('isActive', true)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Alt bölgeler alınırken hata oluştu:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!parentId, // parentId varsa sorgu çalıştır
    staleTime: 60 * 1000, // 1 dakika boyunca önbellekte tut
  });
}

/**
 * useRegionById
 * 
 * Belirli bir ID'ye sahip bölgeyi getiren hook
 * @param regionId - Bölge ID'si
 * @returns Bölge verisi ve sorgu durumu
 */
export function useRegionById(regionId: string | null) {
  return useQuery<Region | null, Error>({
    queryKey: ['region', regionId],
    queryFn: async () => {
      if (!regionId) return null;
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('Region')
        .select('*')
        .eq('id', regionId)
        .single();
      
      if (error) {
        console.error(`ID'si ${regionId} olan bölge alınırken hata oluştu:`, error);
        return null;
      }
      
      return data;
    },
    enabled: !!regionId, // regionId varsa sorgu çalıştır
    staleTime: 60 * 1000, // 1 dakika boyunca önbellekte tut
  });
}

/**
 * Villa filtreleme bileşeni için kullanılacak özel hook
 * @param initialFilters - Başlangıç filtreleri
 * @returns Filtreleme verileri ve işlevleri
 */
export function useVillaFilters(initialFilters: Partial<VillaFilters> = {}) {
  const regions = useRegions();
  const [filters, setFilters] = useState<VillaFilters>({
    page: 1,
    limit: 6,
    status: 'ACTIVE',
    ...initialFilters
  });

  // Bölge değişikliğinde alt bölge filtresini sıfırla
  const handleRegionChange = useCallback((regionId: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      regionId,
      subRegionId: undefined,
      page: 1 // Bölge değiştiğinde ilk sayfaya dön
    }));
  }, []);

  // Alt bölge değişikliği
  const handleSubRegionChange = useCallback((subRegionId: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      subRegionId,
      page: 1 // Alt bölge değiştiğinde ilk sayfaya dön
    }));
  }, []);

  // Misafir sayısı değişikliği
  const handleGuestsChange = useCallback((minGuests: number | undefined) => {
    setFilters(prev => ({
      ...prev,
      minGuests,
      page: 1
    }));
  }, []);

  // Etiket değişikliği
  const handleTagsChange = useCallback((tags: string[] | undefined) => {
    setFilters(prev => ({
      ...prev,
      tags,
      page: 1
    }));
  }, []);

  // Sayfa değişikliği
  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  }, []);

  // Tüm filtreleri temizle
  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: filters.limit, // Limit'i koru
      status: 'ACTIVE'
    });
  }, [filters.limit]);

  return {
    filters,
    setFilters,
    regions: regions.data || [],
    isLoading: regions.isLoading,
    handleRegionChange,
    handleSubRegionChange,
    handleGuestsChange,
    handleTagsChange,
    handlePageChange,
    clearFilters
  };
} 