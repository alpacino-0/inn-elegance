'use client';

import type { FilterParams, RegionOption as FilterRegionOption } from '@/types/filter';
import { DateRangePicker } from '@/components/villa-kiralama/filters/DateRangePicker';
import { GuestPicker } from '@/components/villa-kiralama/filters/GuestPicker';
import { RegionFilter } from '@/components/villa-kiralama/filters/RegionFilter';
import { TagFilter } from '@/components/villa-kiralama/filters/TagFilter';
import { useRegions } from '@/hooks/use-regions';
import { useTags } from '@/hooks/use-tags';
import { Skeleton } from '@/components/ui/skeleton';

// Dictionary tipini ekleyelim
interface Dictionary {
  villaListing?: {
    filters?: {
      title?: string;
      location?: string;
      date?: string;
      guests?: string;
      features?: string;
      [key: string]: string | undefined;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface VillaFiltersProps {
  currentFilters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
  dictionary?: Dictionary;
}

// Hook'un döndürdüğü bölge tipini tanımlayalım
interface HookRegion {
  id: string;
  name: string;
  isMainRegion?: boolean;
  parentId?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  isPromoted?: boolean;
  slug?: string;
  villaCount?: number | null;
  isActive?: boolean;
  metaTitle?: string | null;
  metaDesc?: string | null;
  subRegions?: Array<{
    id: string;
    name: string;
    count?: number;
  }>;
}

// Hook'tan gelen bölge verilerini Filter'da beklenen tipe dönüştürme
function convertRegionOptions(regions: HookRegion[]): FilterRegionOption[] {
  return regions.map(region => ({
    id: region.id,
    name: region.name,
    // null değerini undefined'a dönüştür
    parentId: region.parentId === null ? undefined : region.parentId,
    count: region.villaCount || 0,
    subRegions: region.subRegions?.map(sub => ({
      id: sub.id,
      name: sub.name,
      count: sub.count || 0
    })) || []
  }));
}

export function VillaFilters({ currentFilters, onFilterChange, dictionary }: VillaFiltersProps) {
  // Dictionary'den metinleri al veya varsayılan değerleri kullan
  const filtersDict = dictionary?.villaListing?.filters || {};
  
  const filtersTitle = filtersDict.title || 'Filtreler';
  const locationText = filtersDict.location || 'Konum';
  const dateText = filtersDict.date || 'Tarih';
  const guestsText = filtersDict.guests || 'Misafir Sayısı';
  const featuresText = filtersDict.features || 'Villa Özellikleri';

  // Bölge verilerini API'den çek
  const { data: hookRegions = [], isLoading: isRegionsLoading } = useRegions();
  
  // Tipleri dönüştür - Any tipinden kurtulmak için tip dönüşümü yapıyoruz
  const regions = convertRegionOptions(hookRegions as HookRegion[]);
  
  // Etiket verilerini API'den çek
  const { data: tags = [], isLoading: isTagsLoading } = useTags();

  // isLoading durumunu tanımla
  const isLoading = {
    regions: isRegionsLoading,
    tags: isTagsLoading,
  };

  const handleDateChange = (checkIn?: Date, checkOut?: Date) => {
    if (checkIn && checkOut) {
      // Gece sayısını hesaplayalım
      const nightCount = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`Seçilen tarihler: ${checkIn.toISOString().split('T')[0]} - ${checkOut.toISOString().split('T')[0]}`);
      console.log(`Toplam seçilen gece sayısı: ${nightCount}`);
    }
    
    onFilterChange({
      ...currentFilters,
      checkIn,
      checkOut,
      page: 1,
    });
  };

  const handleGuestCountChange = (guests: number) => {
    onFilterChange({
      ...currentFilters,
      guests,
      page: 1,
    });
  };

  const handleRegionChange = (regionId?: string, subRegionId?: string) => {
    onFilterChange({
      ...currentFilters,
      regionId,
      subRegionId,
      page: 1,
    });
  };

  const handleTagsChange = (tagIds: string[]) => {
    onFilterChange({
      ...currentFilters,
      tagIds,
      page: 1,
    });
  };

  return (
    <div className="space-y-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold border-b pb-2">{filtersTitle}</h2>
      
      {/* Tarih Seçici */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{dateText}</h3>
        <DateRangePicker
          startDate={currentFilters.checkIn}
          endDate={currentFilters.checkOut}
          onChange={handleDateChange}
        />
      </div>
      
      {/* Misafir Sayısı Seçici */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{guestsText}</h3>
        <GuestPicker
          value={currentFilters.guests || 1}
          onChange={handleGuestCountChange}
        />
      </div>
      
      {/* Bölge Filtresi */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{locationText}</h3>
        {isLoading.regions ? (
          <Skeleton className="h-10 w-full rounded-lg" />
        ) : (
          <RegionFilter
            regions={regions}
            selectedRegionId={currentFilters.regionId}
            selectedSubRegionId={currentFilters.subRegionId}
            isLoading={isLoading.regions}
            onChange={handleRegionChange}
            dictionary={dictionary}
          />
        )}
      </div>
      
      {/* Özellik Filtreleri */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{featuresText}</h3>
        {isLoading.tags ? (
          <Skeleton className="h-10 w-full rounded-lg" />
        ) : (
          <TagFilter
            tags={tags}
            selectedTagIds={currentFilters.tagIds || []}
            isLoading={isLoading.tags}
            onChange={handleTagsChange}
            dictionary={dictionary}
          />
        )}
      </div>
    </div>
  );
} 