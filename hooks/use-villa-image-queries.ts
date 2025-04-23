import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { villaApi } from '@/utils/api-client';
import type { CreateVillaImageDto, UpdateVillaImageDto } from '@/types/villa-image';

/**
 * Villa görsellerini getiren hook
 */
export function useVillaImages(villaId: string) {
  return useQuery({
    queryKey: ['villaImages', villaId],
    queryFn: () => villaApi.getVillaImages(villaId),
    enabled: !!villaId,
  });
}

/**
 * Belirli bir villa görselini getiren hook
 */
export function useVillaImageById(villaId: string, imageId: string) {
  return useQuery({
    queryKey: ['villaImage', villaId, imageId],
    queryFn: () => villaApi.getVillaById(villaId),
    enabled: !!(villaId && imageId),
  });
}

/**
 * Yeni villa görseli ekleyen mutation hook
 */
export function useAddVillaImage(villaId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (imageData: CreateVillaImageDto) => villaApi.addVillaImage(villaId, imageData),
    onSuccess: () => {
      // Villa görüntü listesini geçersiz kıl
      queryClient.invalidateQueries({ queryKey: ['villaImages', villaId] });
    },
  });
}

/**
 * Villa görselini güncelleyen mutation hook
 */
export function useUpdateVillaImage(villaId: string, imageId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: UpdateVillaImageDto) => villaApi.updateVillaImage(villaId, updates),
    onSuccess: () => {
      // Villa görüntü listesini ve detayı geçersiz kıl
      queryClient.invalidateQueries({ queryKey: ['villaImages', villaId] });
      queryClient.invalidateQueries({ queryKey: ['villaImage', villaId, imageId] });
    },
  });
}

/**
 * Villa görselini silen mutation hook
 */
export function useDeleteVillaImage(villaId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (imageId: string) => villaApi.deleteVillaImage(imageId),
    onSuccess: (_, imageId) => {
      // Villa görüntü listesini geçersiz kıl
      queryClient.invalidateQueries({ queryKey: ['villaImages', villaId] });
      // Silinen görüntü için detay sorgusunu temizle
      queryClient.removeQueries({ queryKey: ['villaImage', villaId, imageId] });
    },
  });
} 