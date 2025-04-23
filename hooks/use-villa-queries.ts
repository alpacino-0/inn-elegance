import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { villaApi, tagApi } from '@/utils/api-client';
import type { CreateVillaDto, UpdateVillaDto, VillaFilters } from '@/types/villa';

/**
 * Villa listesini getiren hook
 */
export function useVillas(filters?: VillaFilters) {
  return useQuery({
    queryKey: ['villas', filters],
    queryFn: () => villaApi.getVillas(filters),
  });
}

/**
 * Belirli bir villayı ID ile getiren hook
 */
export function useVillaById(villaId: string, options = {}) {
  return useQuery({
    queryKey: ['villa', villaId],
    queryFn: () => villaApi.getVillaById(villaId),
    enabled: !!villaId,
    ...options,
  });
}

/**
 * Belirli bir villayı slug ile getiren hook
 */
export function useVillaBySlug(slug: string, options = {}) {
  return useQuery({
    queryKey: ['villa', 'slug', slug],
    queryFn: () => villaApi.getVillaBySlug(slug),
    enabled: !!slug,
    ...options,
  });
}

/**
 * Öne çıkan villaları getiren hook
 */
export function usePromotedVillas(limit?: number) {
  return useQuery({
    queryKey: ['villas', 'promoted', { limit }],
    queryFn: () => villaApi.getPromotedVillas(limit),
  });
}

/**
 * Bölgeye göre villaları getiren hook
 */
export function useVillasByRegion(regionId: string, includeSubRegions = true, filters?: Omit<VillaFilters, 'regionId' | 'subRegionId'>) {
  return useQuery({
    queryKey: ['villas', 'byRegion', regionId, includeSubRegions, filters],
    queryFn: () => villaApi.getVillasByRegion(regionId, includeSubRegions, filters),
    enabled: !!regionId,
  });
}

/**
 * Yöneticiye göre villaları getiren hook
 */
export function useVillasByManager(managerId: string, filters?: Omit<VillaFilters, 'managerId'>) {
  return useQuery({
    queryKey: ['villas', 'byManager', managerId, filters],
    queryFn: () => villaApi.getVillasByManager(managerId, filters),
    enabled: !!managerId,
  });
}

/**
 * Yeni villa oluşturan mutation hook
 */
export function useCreateVilla() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (villaData: CreateVillaDto) => villaApi.createVilla(villaData),
    onSuccess: () => {
      // Villa listesi sorgusunu geçersiz kıl
      queryClient.invalidateQueries({ queryKey: ['villas'] });
    },
  });
}

/**
 * Villa güncelleyen mutation hook
 */
export function useUpdateVilla(villaId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: UpdateVillaDto) => villaApi.updateVilla(villaId, updates),
    onSuccess: (data) => {
      // Villa listesi ve detay sorgularını geçersiz kıl
      queryClient.invalidateQueries({ queryKey: ['villas'] });
      queryClient.invalidateQueries({ queryKey: ['villa', villaId] });
      // Eğer slug güncellenirse slug ile erişim de geçersiz kılınmalı
      if (data.data?.slug) {
        queryClient.invalidateQueries({ queryKey: ['villa', 'slug', data.data.slug] });
      }
    },
  });
}

/**
 * Villa silen mutation hook (hard delete)
 */
export function useDeleteVilla() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (villaId: string) => villaApi.deleteVilla(villaId),
    onSuccess: (_, villaId) => {
      // Villa listesi sorgusunu geçersiz kıl
      queryClient.invalidateQueries({ queryKey: ['villas'] });
      // Villa detay sorgusunu sil
      queryClient.removeQueries({ queryKey: ['villa', villaId] });
    },
  });
}

/**
 * Villayı devre dışı bırakan mutation hook (soft delete)
 */
export function useDeactivateVilla() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (villaId: string) => villaApi.deactivateVilla(villaId),
    onSuccess: (_, villaId) => {
      // Villa listesi ve detay sorgularını geçersiz kıl
      queryClient.invalidateQueries({ queryKey: ['villas'] });
      queryClient.invalidateQueries({ queryKey: ['villa', villaId] });
    },
  });
}

/**
 * Villa etiketlerini getiren hook
 */
export function useVillaTags(villaId: string, options = {}) {
  return useQuery({
    queryKey: ['villaTags', villaId],
    queryFn: () => villaApi.getVillaTags(villaId),
    enabled: !!villaId,
    ...options,
  });
}

/**
 * Tüm etiketleri getiren hook
 */
export function useTags(search?: string) {
  return useQuery({
    queryKey: ['tags', { search }],
    queryFn: () => tagApi.getTags(search),
  });
}

/**
 * Villaya etiket ekleyen mutation hook
 */
export function useAddVillaTag(villaId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (tagId: string) => villaApi.addVillaTag(villaId, tagId),
    onSuccess: () => {
      // Villa etiketleri sorgusunu geçersiz kıl
      queryClient.invalidateQueries({ queryKey: ['villaTags', villaId] });
    },
    onError: (error) => {
      console.error('Etiket eklenirken hata:', error);
    },
  });
}

/**
 * Villadan etiket kaldıran mutation hook
 */
export function useRemoveVillaTag(villaId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (tagId: string) => villaApi.removeVillaTag(villaId, tagId),
    onSuccess: () => {
      // Villa etiketleri sorgusunu geçersiz kıl
      queryClient.invalidateQueries({ queryKey: ['villaTags', villaId] });
    },
  });
}

/**
 * Villa etiketlerini SQL sorgusuyla güncelleyen mutation hook
 */
export function useUpdateVillaTagsField() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => villaApi.updateVillaTagsField(),
    onSuccess: () => {
      // Tüm villaları geçersiz kıl, çünkü birden fazla villa etkilenmiş olabilir
      queryClient.invalidateQueries({ queryKey: ['villas'] });
      // Ayrıca detay sayfalarını da geçersiz kılalım, ancak burası daha spesifik yapılabilir
      queryClient.invalidateQueries({ queryKey: ['villa'] });
    },
  });
} 