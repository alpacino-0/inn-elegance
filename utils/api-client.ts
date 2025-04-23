import type { Region } from '@/app/api/regions/utils';
import type { Tag } from '@/app/api/tags/utils';
import type { VillaAmenity } from '@/app/api/villa-amenities/utils';
import type { CreateVillaDto, PaginatedVillas, UpdateVillaDto, Villa, VillaFilters } from '@/types/villa';
import type { VillaImage, CreateVillaImageDto, UpdateVillaImageDto } from '@/types/villa-image';
import type { SeasonalPrice, CreateSeasonalPriceDto, UpdateSeasonalPriceDto, SeasonalPriceFilters } from '@/types/seasonal-price';
import type { Currency, CreateCurrencyDto, UpdateCurrencyDto, CurrencyFilters } from '@/types/currency';

// API hata tipi
export interface ApiError {
  message: string;
  status: number;
  details?: string;
}

// Temel API sonuç tipi
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

// API isteği göndermek için temel fonksiyon
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: {
          message: data.error || 'Bir hata oluştu',
          status: response.status,
          details: data.details,
        },
      };
    }

    return { data: data as T };
  } catch (error) {
    return {
      error: {
        message: 'API isteği sırasında bir hata oluştu',
        status: 500,
        details: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

// Region API'si için yardımcı fonksiyonlar
export const regionApi = {
  // Tüm bölgeleri veya filtrelenmiş bölgeleri getir
  getRegions: async (filters?: {
    isActive?: boolean;
    isMainRegion?: boolean;
    isPromoted?: boolean;
    parentId?: string;
  }): Promise<ApiResponse<Region[]>> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
      if (filters.isMainRegion !== undefined) queryParams.append('isMainRegion', String(filters.isMainRegion));
      if (filters.isPromoted !== undefined) queryParams.append('isPromoted', String(filters.isPromoted));
      if (filters.parentId) queryParams.append('parentId', filters.parentId);
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchApi<Region[]>(`/api/regions${query}`);
  },

  // ID ile belirli bir bölgeyi getir
  getRegionById: async (id: string): Promise<ApiResponse<Region>> => {
    return fetchApi<Region>(`/api/regions/${id}`);
  },

  // Slug ile belirli bir bölgeyi getir
  getRegionBySlug: async (slug: string): Promise<ApiResponse<Region>> => {
    return fetchApi<Region>(`/api/regions/slug/${slug}`);
  },

  // Yeni bölge oluştur
  createRegion: async (region: Partial<Region>): Promise<ApiResponse<Region>> => {
    return fetchApi<Region>('/api/regions', {
      method: 'POST',
      body: JSON.stringify(region),
    });
  },

  // Bölge güncelle
  updateRegion: async (id: string, updates: Partial<Region>): Promise<ApiResponse<Region>> => {
    return fetchApi<Region>(`/api/regions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Bölge sil (hard delete)
  deleteRegion: async (id: string): Promise<ApiResponse<{ message: string; id: string }>> => {
    return fetchApi<{ message: string; id: string }>(`/api/regions/${id}`, {
      method: 'DELETE',
    });
  },

  // Bölgeyi deaktif et (soft delete)
  deactivateRegion: async (id: string): Promise<ApiResponse<{ message: string; id: string }>> => {
    return fetchApi<{ message: string; id: string }>(`/api/regions/${id}?soft=true`, {
      method: 'DELETE',
    });
  },

  // Ana bölgeleri getir
  getMainRegions: async (includeInactive = false): Promise<ApiResponse<Region[]>> => {
    return regionApi.getRegions({ 
      isMainRegion: true, 
      isActive: includeInactive ? undefined : true 
    });
  },

  // Alt bölgeleri getir
  getSubRegions: async (parentId: string, includeInactive = false): Promise<ApiResponse<Region[]>> => {
    return regionApi.getRegions({ 
      parentId, 
      isActive: includeInactive ? undefined : true 
    });
  },

  // Öne çıkan bölgeleri getir
  getPromotedRegions: async (): Promise<ApiResponse<Region[]>> => {
    return regionApi.getRegions({ isPromoted: true, isActive: true });
  },
};

// Tag API'si için yardımcı fonksiyonlar
export const tagApi = {
  // Tüm etiketleri getir
  getTags: async (search?: string): Promise<ApiResponse<Tag[]>> => {
    const queryParams = new URLSearchParams();
    
    if (search) {
      queryParams.append('search', search);
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchApi<Tag[]>(`/api/tags${query}`);
  },

  // ID ile belirli bir etiketi getir
  getTagById: async (id: string): Promise<ApiResponse<Tag>> => {
    return fetchApi<Tag>(`/api/tags/${id}`);
  },

  // Yeni etiket oluştur
  createTag: async (name: string): Promise<ApiResponse<Tag>> => {
    return fetchApi<Tag>('/api/tags', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  // Etiket güncelle
  updateTag: async (id: string, name: string): Promise<ApiResponse<Tag>> => {
    return fetchApi<Tag>(`/api/tags/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  },

  // Etiket sil
  deleteTag: async (id: string): Promise<ApiResponse<{ message: string; id: string }>> => {
    return fetchApi<{ message: string; id: string }>(`/api/tags/${id}`, {
      method: 'DELETE',
    });
  },

  // İsimle etiket ara
  searchTags: async (name: string): Promise<ApiResponse<Tag[]>> => {
    return tagApi.getTags(name);
  },
};

// VillaAmenity API'si için yardımcı fonksiyonlar
export const villaAmenityApi = {
  // Belirli bir villaya ait olanakları getir
  getVillaAmenities: async (villaId: string): Promise<ApiResponse<VillaAmenity[]>> => {
    return fetchApi<VillaAmenity[]>(`/api/villas/${villaId}/amenities`);
  },

  // Belirli bir olanağın detaylarını getir
  getAmenityById: async (id: string): Promise<ApiResponse<VillaAmenity>> => {
    return fetchApi<VillaAmenity>(`/api/villa-amenities/${id}`);
  },

  // Villaya yeni bir olanak ekle
  addAmenity: async (villaId: string, amenityData: { name: string; icon?: string | null }): Promise<ApiResponse<VillaAmenity>> => {
    return fetchApi<VillaAmenity>(`/api/villas/${villaId}/amenities`, {
      method: 'POST',
      body: JSON.stringify(amenityData),
    });
  },

  // Olanak güncelle
  updateAmenity: async (id: string, updates: { name?: string; icon?: string | null }): Promise<ApiResponse<VillaAmenity>> => {
    return fetchApi<VillaAmenity>(`/api/villa-amenities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Olanak sil
  deleteAmenity: async (id: string): Promise<ApiResponse<{ message: string; id: string; villaId: string }>> => {
    return fetchApi<{ message: string; id: string; villaId: string }>(`/api/villa-amenities/${id}`, {
      method: 'DELETE',
    });
  },
};

// Villa API'si için yardımcı fonksiyonlar
export const villaApi = {
  // Tüm villaları veya filtrelenmiş villaları getir
  getVillas: async (filters?: VillaFilters): Promise<ApiResponse<PaginatedVillas>> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            for (const item of value) {
              queryParams.append(`${key}[]`, String(item));
            }
          } else {
            queryParams.append(key, String(value));
          }
        }
      }
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchApi<PaginatedVillas>(`/api/villas${query}`);
  },

  // ID ile belirli bir villayı getir
  getVillaById: async (id: string): Promise<ApiResponse<Villa>> => {
    return fetchApi<Villa>(`/api/villas/${id}`);
  },

  // Slug ile belirli bir villayı getir
  getVillaBySlug: async (slug: string): Promise<ApiResponse<Villa>> => {
    return fetchApi<Villa>(`/api/villas/slug/${slug}`);
  },

  // Öne çıkan villaları getir
  getPromotedVillas: async (limit?: number): Promise<ApiResponse<Villa[]>> => {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append('limit', String(limit));
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchApi<Villa[]>(`/api/villas/promoted${query}`);
  },

  // Bölgeye göre villaları getir
  getVillasByRegion: async (
    regionId: string, 
    includeSubRegions = true, 
    filters?: Omit<VillaFilters, 'regionId' | 'subRegionId'>
  ): Promise<ApiResponse<PaginatedVillas>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('regionId', regionId);
    queryParams.append('includeSubRegions', String(includeSubRegions));
    
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            for (const item of value) {
              queryParams.append(`${key}[]`, String(item));
            }
          } else {
            queryParams.append(key, String(value));
          }
        }
      }
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchApi<PaginatedVillas>(`/api/villas${query}`);
  },

  // Yöneticiye göre villaları getir
  getVillasByManager: async (
    managerId: string, 
    filters?: Omit<VillaFilters, 'managerId'>
  ): Promise<ApiResponse<PaginatedVillas>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('managerId', managerId);
    
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            for (const item of value) {
              queryParams.append(`${key}[]`, String(item));
            }
          } else {
            queryParams.append(key, String(value));
          }
        }
      }
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchApi<PaginatedVillas>(`/api/villas${query}`);
  },

  // Yeni villa oluştur
  createVilla: async (villaData: CreateVillaDto): Promise<ApiResponse<Villa>> => {
    return fetchApi<Villa>('/api/villas', {
      method: 'POST',
      body: JSON.stringify(villaData),
    });
  },

  // Villa güncelle
  updateVilla: async (id: string, updates: UpdateVillaDto): Promise<ApiResponse<Villa>> => {
    return fetchApi<Villa>(`/api/villas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Villa sil (hard delete)
  deleteVilla: async (id: string): Promise<ApiResponse<{ message: string; id: string }>> => {
    return fetchApi<{ message: string; id: string }>(`/api/villas/${id}`, {
      method: 'DELETE',
    });
  },

  // Villayı deaktif et (soft delete)
  deactivateVilla: async (id: string): Promise<ApiResponse<{ message: string; id: string }>> => {
    return fetchApi<{ message: string; id: string }>(`/api/villas/${id}?soft=true`, {
      method: 'DELETE',
    });
  },

  // Villa fotoğrafları
  getVillaImages: async (villaId: string): Promise<ApiResponse<VillaImage[]>> => {
    return fetchApi<VillaImage[]>(`/api/villas/${villaId}/images`);
  },

  addVillaImage: async (villaId: string, imageData: CreateVillaImageDto): Promise<ApiResponse<VillaImage>> => {
    return fetchApi<VillaImage>(`/api/villas/${villaId}/images`, {
      method: 'POST',
      body: JSON.stringify(imageData),
    });
  },

  updateVillaImage: async (id: string, updates: UpdateVillaImageDto): Promise<ApiResponse<VillaImage>> => {
    return fetchApi<VillaImage>(`/api/villa-images/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  deleteVillaImage: async (id: string): Promise<ApiResponse<{ message: string; id: string }>> => {
    return fetchApi<{ message: string; id: string }>(`/api/villa-images/${id}`, {
      method: 'DELETE',
    });
  },

  // Villa olanakları
  getVillaAmenities: async (villaId: string): Promise<ApiResponse<VillaAmenity[]>> => {
    return villaAmenityApi.getVillaAmenities(villaId);
  },

  addVillaAmenity: async (villaId: string, amenityData: { name: string; icon?: string | null }): Promise<ApiResponse<VillaAmenity>> => {
    return villaAmenityApi.addAmenity(villaId, amenityData);
  },

  updateVillaAmenity: async (id: string, updates: { name?: string; icon?: string | null }): Promise<ApiResponse<VillaAmenity>> => {
    return villaAmenityApi.updateAmenity(id, updates);
  },

  deleteVillaAmenity: async (id: string): Promise<ApiResponse<{ message: string; id: string; villaId: string }>> => {
    return villaAmenityApi.deleteAmenity(id);
  },

  // Villa etiketleri
  getVillaTags: async (villaId: string): Promise<ApiResponse<Tag[]>> => {
    return fetchApi<Tag[]>(`/api/villas/${villaId}/tags`);
  },

  addVillaTag: async (villaId: string, tagId: string): Promise<ApiResponse<{ villaId: string; tagId: string }>> => {
    return fetchApi<{ villaId: string; tagId: string }>(`/api/villas/${villaId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tagId }),
    });
  },

  removeVillaTag: async (villaId: string, tagId: string): Promise<ApiResponse<{ message: string; villaId: string; tagId: string }>> => {
    return fetchApi<{ message: string; villaId: string; tagId: string }>(`/api/villas/${villaId}/tags/${tagId}`, {
      method: 'DELETE',
    });
  },

  // Villa tags alanını güncelle (SQL sorgusunu çalıştır)
  updateVillaTagsField: async (): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    return fetchApi<{ success: boolean; message: string }>('/api/villas/update-tags', {
      method: 'POST',
    });
  },
};

// SeasonalPrice API'si için yardımcı fonksiyonlar
export const seasonalPriceApi = {
  // Belirli bir villanın sezon fiyatlarını getir
  getVillaSeasonalPrices: async (villaId: string, filters?: SeasonalPriceFilters): Promise<ApiResponse<SeasonalPrice[]>> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
      if (filters.startDateAfter) queryParams.append('startDateAfter', filters.startDateAfter);
      if (filters.endDateBefore) queryParams.append('endDateBefore', filters.endDateBefore);
      if (filters.currencyId) queryParams.append('currencyId', filters.currencyId);
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchApi<SeasonalPrice[]>(`/api/villas/${villaId}/seasonal-prices${query}`);
  },

  // ID ile belirli bir sezon fiyatını getir
  getSeasonalPriceById: async (id: string): Promise<ApiResponse<SeasonalPrice>> => {
    return fetchApi<SeasonalPrice>(`/api/seasonal-prices/${id}`);
  },

  // Yeni sezon fiyatı oluştur
  createSeasonalPrice: async (villaId: string, priceData: CreateSeasonalPriceDto): Promise<ApiResponse<SeasonalPrice>> => {
    return fetchApi<SeasonalPrice>(`/api/villas/${villaId}/seasonal-prices`, {
      method: 'POST',
      body: JSON.stringify(priceData),
    });
  },

  // Sezon fiyatı güncelle
  updateSeasonalPrice: async (id: string, updates: UpdateSeasonalPriceDto): Promise<ApiResponse<SeasonalPrice>> => {
    return fetchApi<SeasonalPrice>(`/api/seasonal-prices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Sezon fiyatı sil
  deleteSeasonalPrice: async (id: string): Promise<ApiResponse<{ message: string; id: string }>> => {
    return fetchApi<{ message: string; id: string }>(`/api/seasonal-prices/${id}`, {
      method: 'DELETE',
    });
  },

  // Para birimleri listesini getir
  getCurrencies: async (isActive: boolean = true): Promise<ApiResponse<{ id: string; code: string; name: string; symbol: string }[]>> => {
    const query = isActive ? '?isActive=true' : '';
    return fetchApi<{ id: string; code: string; name: string; symbol: string }[]>(`/api/currencies${query}`);
  },
};

// Currency API'si için yardımcı fonksiyonlar
export const currencyApi = {
  // Tüm para birimlerini veya filtrelenmiş para birimlerini getir
  getCurrencies: async (filters?: CurrencyFilters): Promise<ApiResponse<Currency[]>> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.isActive !== undefined) queryParams.append('isActive', String(filters.isActive));
      if (filters.isDefault !== undefined) queryParams.append('isDefault', String(filters.isDefault));
      if (filters.autoUpdate !== undefined) queryParams.append('autoUpdate', String(filters.autoUpdate));
      if (filters.search) queryParams.append('search', filters.search);
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchApi<Currency[]>(`/api/currencies${query}`);
  },

  // ID ile belirli bir para birimini getir
  getCurrencyById: async (id: string): Promise<ApiResponse<Currency>> => {
    return fetchApi<Currency>(`/api/currencies/${id}`);
  },

  // Kod ile belirli bir para birimini getir
  getCurrencyByCode: async (code: string): Promise<ApiResponse<Currency>> => {
    return fetchApi<Currency>(`/api/currencies/code/${code}`);
  },

  // Varsayılan para birimini getir
  getDefaultCurrency: async (): Promise<ApiResponse<Currency>> => {
    return fetchApi<Currency>(`/api/currencies?isDefault=true&isActive=true`);
  },

  // Yeni para birimi oluştur
  createCurrency: async (currencyData: CreateCurrencyDto): Promise<ApiResponse<Currency>> => {
    return fetchApi<Currency>('/api/currencies', {
      method: 'POST',
      body: JSON.stringify(currencyData),
    });
  },

  // Para birimi güncelle
  updateCurrency: async (id: string, updates: UpdateCurrencyDto): Promise<ApiResponse<Currency>> => {
    return fetchApi<Currency>(`/api/currencies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Para birimi sil (hard delete)
  deleteCurrency: async (id: string): Promise<ApiResponse<{ message: string; id: string }>> => {
    return fetchApi<{ message: string; id: string }>(`/api/currencies/${id}`, {
      method: 'DELETE',
    });
  },

  // Para birimini deaktif et (soft delete)
  deactivateCurrency: async (id: string): Promise<ApiResponse<{ message: string; id: string; currency: Currency }>> => {
    return fetchApi<{ message: string; id: string; currency: Currency }>(`/api/currencies/${id}?soft=true`, {
      method: 'DELETE',
    });
  },

  // Para birimi dönüşümü yap
  convertCurrency: async (amount: number, fromCurrency: string, toCurrency: string): Promise<ApiResponse<{ amount: number; fromCurrency: string; toCurrency: string; result: number }>> => {
    const params = new URLSearchParams({
      amount: String(amount),
      from: fromCurrency,
      to: toCurrency
    });
    
    return fetchApi<{ amount: number; fromCurrency: string; toCurrency: string; result: number }>(
      `/api/currencies/convert?${params.toString()}`
    );
  },
}; 