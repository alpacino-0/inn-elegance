'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import type { FilterParams } from '@/types/filter';
import type { Villa } from '@/types/villa';
import { VillaFilters as VillaFiltersComponent } from '@/components/villa-kiralama/filters/VillaFilters';
import { VillaGrid } from '@/components/villa-kiralama/grid/VillaGrid';
import { ActiveFilters } from '@/components/villa-kiralama/filters/ActiveFilters';
import { Status } from '@/types/enums'; 
import type { SupabaseClient } from '@supabase/supabase-js';


// VillaListResponse tipini tanımlayalım
interface VillaListResponse {
  items: Villa[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// URL'den filtre parametrelerini parse etme
function parseUrlToFilters(searchParams: URLSearchParams): FilterParams {
  const checkInStr = searchParams.get('checkIn');
  const checkOutStr = searchParams.get('checkOut');
  const guestsStr = searchParams.get('guests');
  const regionIdStr = searchParams.get('regionId');
  const subRegionIdStr = searchParams.get('subRegionId');
  const tagIdsStr = searchParams.get('tagIds');
  const pageStr = searchParams.get('page');
  const limitStr = searchParams.get('limit');

  return {
    checkIn: checkInStr ? new Date(checkInStr) : undefined,
    checkOut: checkOutStr ? new Date(checkOutStr) : undefined,
    guests: guestsStr ? Number.parseInt(guestsStr, 10) : undefined,
    regionId: regionIdStr || undefined,
    subRegionId: subRegionIdStr || undefined,
    tagIds: tagIdsStr?.split(','),
    page: pageStr ? Number.parseInt(pageStr, 10) : 1,
    limit: limitStr ? Number.parseInt(limitStr, 10) : 6
  };
}

// Filtreleri URL'e dönüştürme
function filtersToUrl(filters: FilterParams): string {
  const params = new URLSearchParams();

  if (filters.checkIn) params.set('checkIn', filters.checkIn.toISOString());
  if (filters.checkOut) params.set('checkOut', filters.checkOut.toISOString());
  if (filters.guests) params.set('guests', filters.guests.toString());
  if (filters.regionId) params.set('regionId', filters.regionId);
  if (filters.subRegionId) params.set('subRegionId', filters.subRegionId);
  if (filters.tagIds?.length) params.set('tagIds', filters.tagIds.join(','));
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());

  return params.toString();
}

// Filtre kaldırma fonksiyonu
function removeFilter(filters: FilterParams, key: keyof FilterParams): FilterParams {
  const newFilters = { ...filters };

  switch (key) {
    case 'checkIn':
    case 'checkOut':
      newFilters.checkIn = undefined;
      newFilters.checkOut = undefined;
      break;
    case 'regionId':
      newFilters.regionId = undefined;
      newFilters.subRegionId = undefined;
      break;
    case 'subRegionId':
      newFilters.subRegionId = undefined;
      break;
    case 'tagIds':
      newFilters.tagIds = undefined;
      break;
    default:
      newFilters[key] = undefined;
  }

  newFilters.page = 1; // Reset to first page when a filter is removed
  return newFilters;
}

// Villa sorgusunu temsil eden bir tip tanımlayalım
// Supabase'in sorgu metodlarını kapsayacak şekilde
interface SupabaseVillaQuery {
  select: (columns: string) => SupabaseVillaQuery;
  eq: (column: string, value: unknown) => SupabaseVillaQuery;
  filter: (column: string, operator: string, value: unknown) => SupabaseVillaQuery;
  gte: (column: string, value: unknown) => SupabaseVillaQuery;
  lt: (column: string, value: unknown) => SupabaseVillaQuery;
  in: (column: string, values: unknown[]) => SupabaseVillaQuery;
  limit: (count: number) => SupabaseVillaQuery;
  offset: (count: number) => SupabaseVillaQuery;
  order: (column: string, options?: { ascending: boolean }) => SupabaseVillaQuery;
  then: <T>(resolve: (value: { data: T; error: Error | null }) => void) => Promise<{ data: T; error: Error | null }>;
}

// Hata mesajları için tutarlı bir format kullanalım
const handleApiError = (message: string, error: Error): Error => {
  console.error(`${message}: ${error.message}`);
  return new Error(`${message}: ${error.message}`);
};

// Daha açıklayıcı fonksiyon adları kullanalım
const parseCheckInDates = (startDate: Date, nightCount: number): string[] => {
  const checkInDates: string[] = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < nightCount; i++) {
    currentDate.setUTCHours(14, 0, 0, 0);
    const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD formatı
    checkInDates.push(dateStr);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return checkInDates;
};

// Değişken adlarını daha anlamlı hale getirelim
const applyDateFilter = async (
  supabase: SupabaseClient,
  query: SupabaseVillaQuery, 
  checkIn: Date, 
  checkOut: Date
) => {
  try {
    // 1. Aktif villa ID'lerini al
    const { data: allVillaIds, error: villaIdError } = await supabase
      .from('Villa')
      .select('id')
      .eq('status', Status.ACTIVE);

    if (villaIdError) {
      throw handleApiError('Villa ID\'leri alınamadı', villaIdError);
    }

    const allVillas = allVillaIds?.map((v: { id: string }) => v.id) || [];

    // 2. Gece sayısını hesapla
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    startDate.setUTCHours(14, 0, 0, 0); // Giriş saati (14:00 UTC)
    endDate.setUTCHours(14, 0, 0, 0);   // Aynı saatte çıkış hesaplaması

    const nightCount = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (nightCount < 1) {
      return { query: query.filter('id', 'eq', 'no-match'), earlyExit: true };
    }

    // 3. Her gece için giriş tarihlerini oluştur
    const stayDates = parseCheckInDates(startDate, nightCount);

    // 4. Tarih aralığındaki tüm takvim etkinliklerini al
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString(); // Çıkış tarihi sorguya dahil edilmez (<)

    const { data: calendarEvents, error: calendarError } = await supabase
      .from('CalendarEvent')
      .select('villaId, date, status')
      .gte('date', startDateStr)
      .lt('date', endDateStr); // Çıkış günü dahil edilmez

    if (calendarError) {
      throw handleApiError('Takvim verisi alınamadı', calendarError);
    }

    // 5. Her villa için her gece müsaitliğini kontrol et
    const villaAvailabilityByDate = new Map<string, Map<string, boolean>>();

    // Tüm villa/geceleri başlangıçta müsait olarak işaretle
    for (const villaId of allVillas) {
      const dateStatusMap = new Map<string, boolean>();
      for (const dateStr of stayDates) {
        dateStatusMap.set(dateStr, true); // Başlangıçta müsait kabul et
      }
      villaAvailabilityByDate.set(villaId, dateStatusMap);
    }

    // Takvim etkinliklerine göre müsaitliği güncelle
    for (const event of calendarEvents || []) {
      const villaId = event.villaId;
      const eventDate = new Date(event.date);
      const dateStr = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD formatı

      const dateStatusMap = villaAvailabilityByDate.get(villaId);
      if (dateStatusMap && stayDates.includes(dateStr)) {
        // Belirli bir gece için etkinlik varsa, villa sadece durum 'AVAILABLE' ise müsaittir
        if (event.status !== 'AVAILABLE') {
          dateStatusMap.set(dateStr, false); // Müsait değil olarak işaretle
        }
      }
    }

    // 6. TÜM geceler için müsait villaları belirle
    const availableVillaIds: string[] = [];
    for (const [villaId, dateStatusMap] of villaAvailabilityByDate.entries()) {
      let isFullyAvailable = true;
      for (const dateStr of stayDates) {
        if (!dateStatusMap.get(dateStr)) { // Gece müsait değil olarak işaretlenmişse kontrol et
          isFullyAvailable = false;
          break;
        }
      }
      if (isFullyAvailable) {
        availableVillaIds.push(villaId);
      }
    }

    // 7. Ana sorguyu müsait villa ID'lerine göre filtrele
    if (availableVillaIds.length === 0) {
      return { query: query.filter('id', 'eq', 'no-match'), earlyExit: false };
    }
    
    return { query: query.in('id', availableVillaIds), earlyExit: false };
  } catch {
    // Parametresiz catch bloğu kullanılabilir
    // Hatayı loglama
    console.error('Tarih filtreleme hatası:');
    // No-match query döndür
    return { query: query.filter('id', 'eq', 'no-match'), earlyExit: false };
  }
};

export default function VillaListingContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Supabase istemcisini oluştur - performans için useMemo kullan
  const supabase = useMemo(() => createClient(), []);

  // Get filters from URL
  const [filters, setFilters] = useState<FilterParams>(() =>
    parseUrlToFilters(searchParams)
  );

  // Filtre kaldırma işlemi için useCallback kullanımı
  const handleFilterRemove = useCallback((key: keyof FilterParams) => {
    setFilters(currentFilters => removeFilter(currentFilters, key));
  }, []);

  // Sayfa değişikliği için useCallback kullanımı
  const handlePageChange = useCallback((page: number) => {
    setFilters(currentFilters => ({ ...currentFilters, page }));
  }, []);

  // Tüm filtreleri temizleme için useCallback kullanımı
  const handleFiltersClear = useCallback(() => {
    setFilters({ page: 1, limit: 6 });
  }, []);

  // Fetch villa data (Supabase)
  const {
    data: villaListData,
    isLoading
  } = useQuery({
    queryKey: ['villas', filters],
    queryFn: async () => {
      let query = supabase
        .from('Villa')
        .select(`
          *,
          images:VillaImage(id, imageUrl, altText, title, isCoverImage, "order"),
          prices:SeasonalPrice(*),
          tags:VillaTag(tagId, Tag(id, name))
        `);

      // Apply filters
      if (filters.regionId) {
        query = query.eq('regionId', filters.regionId);
      }

      if (filters.subRegionId) {
        query = query.eq('subRegionId', filters.subRegionId);
      }

      if (filters.guests) {
        query = query.gte('maxGuests', filters.guests);
      }

      if (filters.tagIds && filters.tagIds.length > 0) {
        // Use VillaTag table for tag filtering
        // Get villa IDs that have the selected tags
        const { data: villaIds, error: tagError } = await supabase
          .from('VillaTag')
          .select('villaId')
          .in('tagId', filters.tagIds);

        if (tagError) {
          throw new Error(`Etiket filtreleme hatası: ${tagError.message}`);
        }

        // If no villas found for the tags, use a non-matching ID for query
        if (!villaIds || villaIds.length === 0) {
          query = query.filter('id', 'eq', 'no-match'); // Will return no results
        } else {
          // Count occurrences of each villa ID to find villas with ALL selected tags
          const villaIdCounts = new Map<string, number>();
          for (const item of villaIds) {
            const id = item.villaId;
            villaIdCounts.set(id, (villaIdCounts.get(id) || 0) + 1);
          }

          const selectedTagCount = filters.tagIds?.length || 0;
          const filteredVillaIds = Array.from(villaIdCounts)
            .filter(([, count]) => count >= selectedTagCount)
            .map(([id]) => id);

          if (filteredVillaIds.length === 0) {
            query = query.filter('id', 'eq', 'no-match');
          } else {
            query = query.in('id', filteredVillaIds);
          }
        }
      }

      // Tarih filtresi: Giriş ve çıkış tarihleri seçildiyse, tüm dönem için müsait villaları filtrele
      if (filters.checkIn && filters.checkOut) {
        const { query: dateFilteredQuery, earlyExit } = await applyDateFilter(
          supabase,
          query as unknown as SupabaseVillaQuery, 
          filters.checkIn, 
          filters.checkOut
        );
        
        query = dateFilteredQuery as unknown as typeof query;
        
        if (earlyExit) {
          const emptyResponse: VillaListResponse = {
            items: [],
            pagination: { total: 0, page: filters.page || 1, limit: filters.limit || 6, totalPages: 0 }
          };
          return emptyResponse;
        }
      }

      // Fetch only active villas
      query = query.eq('status', Status.ACTIVE);

      // Apply pagination - farklı bir yaklaşım
      const pageSize = filters.limit || 6;
      const currentPage = filters.page || 1;
      
      // Sayfalama işlemini Supabase sorgusu yerine JavaScript'te yapalım
      // Önce sıralama uygulayalım
      query = query.order('createdAt', { ascending: false });
      
      // Sorguyu çalıştıralım
      const { data: allData, error: fetchError } = await query;
      
      if (fetchError) {
        throw new Error(`Villa verisi alınırken hata: ${fetchError.message}`);
      }
      
      // JavaScript ile sayfalama uygulayalım
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      const pagedData = allData.slice(start, end);
      
      // Toplam sayım
      const total = allData.length;
      
      // Response objesi oluştur
      const response: VillaListResponse = {
        items: pagedData as Villa[],
        pagination: {
          total,
          page: currentPage,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      };
      
      return response;
    }
  });

  // URL değişimini optimize etme
  useEffect(() => {
    const url = filtersToUrl(filters);
    router.push(`/villa-kiralama${url ? `?${url}` : ''}`, { scroll: false });
  }, [filters, router]);

  // Villa verilerini ve sayfalama bilgilerini memoize etme
  const displayData = useMemo(() => {
    return {
      villas: villaListData?.items || [],
      totalVillas: villaListData?.pagination.total || 0,
      currentPage: filters.page || 1,
      pageSize: filters.limit || 6,
      totalPages: villaListData?.pagination.totalPages || 0
    };
  }, [villaListData, filters.page, filters.limit]);

  return (
    <div className="py-4 sm:py-6 lg:py-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8">
        Kiralık Villalar
      </h1>

      {/* Aktif Filtreler */}
      <ActiveFilters
        filters={filters}
        onRemove={handleFilterRemove}
        onClear={handleFiltersClear}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {/* Sol taraf - Filtreler */}
        <aside className="lg:col-span-1 sticky lg:top-24 self-start h-auto">
          <VillaFiltersComponent
            onFilterChange={setFilters}
            currentFilters={filters}
          />
        </aside>

        {/* Sağ taraf - Villa Listesi */}
        <main className="lg:col-span-3">
          <VillaGrid
            villas={displayData.villas}
            loading={isLoading}
            totalVillas={displayData.totalVillas}
            page={displayData.currentPage}
            limit={displayData.pageSize}
            onPageChange={handlePageChange}
            layout="horizontal"
          />
        </main>
      </div>
    </div>
  );
}
