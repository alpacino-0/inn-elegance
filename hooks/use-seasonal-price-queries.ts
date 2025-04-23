import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { seasonalPriceApi } from '@/utils/api-client';
import type { 
  CreateSeasonalPriceDto, 
  UpdateSeasonalPriceDto, 
  SeasonalPriceFilters,
  SeasonalPrice
} from '@/types/seasonal-price';

/**
 * Belirli bir villanın sezon fiyatlarını getiren hook
 */
export function useVillaSeasonalPrices(villaId: string, filters?: SeasonalPriceFilters) {
  return useQuery({
    queryKey: ['seasonalPrices', villaId, filters],
    queryFn: async () => {
      try {
        // API'yi çağır
        const response = await seasonalPriceApi.getVillaSeasonalPrices(villaId, filters);
        console.log('API yanıtı:', response);
        
        // Hata kontrolü
        if (response.error) {
          console.error('API hatası:', response.error);
          throw new Error(response.error.message);
        }
        
        // Veri dönüşümü
        let prices: SeasonalPrice[] = [];
        
        // response.data'nın türünü kontrol et
        const responseData = response.data as unknown;
        
        // data özelliği varsa ve bu bir diziyse
        if (responseData) {
          if (Array.isArray(responseData)) {
            prices = responseData;
          } else if (typeof responseData === 'object' && 'data' in responseData && Array.isArray(responseData.data)) {
            // İç içe data nesnesi durumu
            prices = responseData.data;
          }
        }
        
        // Fiyatları tarihe göre sırala
        return prices.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      } catch (error) {
        console.error('Seasonal prices fetch error:', error);
        throw error;
      }
    },
    enabled: !!villaId,
    placeholderData: [],
    retry: 2
  });
}

/**
 * Belirli bir sezon fiyat detayını getiren hook
 */
export function useSeasonalPriceById(id: string, options = {}) {
  return useQuery({
    queryKey: ['seasonalPrice', id],
    queryFn: () => seasonalPriceApi.getSeasonalPriceById(id),
    enabled: !!id,
    ...options
  });
}

/**
 * Para birimleri listesini getiren hook
 */
export function useCurrencies(isActive: boolean = true) {
  return useQuery({
    queryKey: ['currencies', { isActive }],
    queryFn: () => seasonalPriceApi.getCurrencies(isActive),
    select: (response) => {
      try {
        // API'den gelen veri farklı formatlarda olabilir, her duruma göre güvenli dönüşüm yapalım

        // 1. Response null/undefined kontrolü
        if (!response) return [];

        // 2. DirectArray kontrolü (doğrudan dizi dönerse - BE boş obje olmadan doğrudan dizi döndürüyor olabilir)
        if (Array.isArray(response)) return response;

        // 3. data property kontrolü (ApiResponse<T> tipinde { data: T } dönerse)
        const dataObject = response as { data?: unknown };
        if (dataObject && typeof dataObject === 'object' && 'data' in dataObject) {
          const data = dataObject.data;
          if (Array.isArray(data)) return data;
          if (data === null || data === undefined) return [];
        }

        // 4. Hiçbir case'e uymuyorsa boş dizi dön
        return [];
      } catch (error) {
        console.error('Currency verisi dönüştürülürken hata:', error);
        return [];
      }
    },
    placeholderData: { data: [] },
    staleTime: 5 * 60 * 1000, // 5 dakika cache
    retry: 2
  });
}

/**
 * Yeni sezon fiyatı oluşturan mutation hook
 */
export function useCreateSeasonalPrice(villaId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (priceData: CreateSeasonalPriceDto) => 
      seasonalPriceApi.createSeasonalPrice(villaId, priceData),
    onSuccess: () => {
      // Villa sezon fiyatları sorgusunu geçersiz kıl
      queryClient.invalidateQueries({ queryKey: ['seasonalPrices', villaId] });
    }
  });
}

/**
 * Sezon fiyatı güncelleyen mutation hook
 */
export function useUpdateSeasonalPrice(id: string, villaId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: UpdateSeasonalPriceDto) => 
      seasonalPriceApi.updateSeasonalPrice(id, updates),
    onSuccess: () => {
      // İlgili sorguları geçersiz kıl
      queryClient.invalidateQueries({ queryKey: ['seasonalPrices', villaId] });
      queryClient.invalidateQueries({ queryKey: ['seasonalPrice', id] });
    }
  });
}

/**
 * Sezon fiyatı silen mutation hook
 */
export function useDeleteSeasonalPrice(villaId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => seasonalPriceApi.deleteSeasonalPrice(id),
    onSuccess: (_, variables) => {
      // İlgili sorguları geçersiz kıl
      queryClient.invalidateQueries({ queryKey: ['seasonalPrices', villaId] });
      // Detay sorgusunu sil
      queryClient.removeQueries({ queryKey: ['seasonalPrice', variables] });
    }
  });
} 