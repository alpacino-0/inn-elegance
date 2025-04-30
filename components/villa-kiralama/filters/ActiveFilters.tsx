'use client';

import { Fragment } from 'react';
import type { FilterParams } from '@/types/filter';
import { useRegions } from '@/hooks/use-regions';
import { useTags } from '@/hooks/use-tags';
import type { FilterOption } from '@/types/filter';

// Region tipi daha doğru bir şekilde tanımlayalım
interface Region {
  id: string;
  name: string;
  subRegions?: Array<{
    id: string;
    name: string;
  }>;
}

interface ActiveFiltersProps {
  filters: FilterParams;
  onRemove: (key: keyof FilterParams) => void;
  onClear: () => void;
}

export function ActiveFilters({ filters, onRemove, onClear }: ActiveFiltersProps) {
  // Metinler Türkçeye çevriliyor
  const activeFiltersText = 'Aktif Filtreler:';
  const regionText = 'Bölge';
  const subRegionText = 'Alt Bölge';
  const featuresText = 'Özellikler';
  const guestsText = 'Misafir';
  const dateText = 'Tarih';
  const removeFilterText = 'Filtreyi kaldır';
  const personText = 'kişi';
  const featureSelectedText = 'özellik seçildi';
  const clearAllFiltersText = 'Tüm Filtreleri Temizle';

  // Bölge verilerini al
  const { data: regionsData = [] } = useRegions();
  // Etiket verilerini al
  const { data: tagsData = [] } = useTags();

  // TypeScript için veri tipi dönüşümleri yapıyoruz
  const regions = regionsData as Region[];
  const tags = tagsData as FilterOption[];

  // Seçilen bölge ve alt bölge adlarını bul
  const selectedRegion = regions.find((r) => r.id === filters.regionId);
  const selectedSubRegion = selectedRegion?.subRegions?.find(
    (sr) => sr.id === filters.subRegionId
  );

  // Aktif filtreler listesi
  const activeFilters: Array<{ key: keyof FilterParams; label: string; value: string }> = [];

  // Tarih filtresi
  if (filters.checkIn && filters.checkOut) {
    const checkInDate = new Date(filters.checkIn);
    const checkOutDate = new Date(filters.checkOut);
    // Basit tarih formatlaması
    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Ay 0'dan başlar
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    activeFilters.push({
      key: 'checkIn', // Her iki tarihi de kaldırmak için checkIn anahtarını kullanıyoruz
      label: dateText,
      value: `${formatDate(checkInDate)} - ${formatDate(checkOutDate)}`
    });
  }

  // Misafir sayısı filtresi
  if (filters.guests) {
    activeFilters.push({
      key: 'guests',
      label: guestsText,
      value: `${filters.guests} ${personText}`
    });
  }

  // Bölge filtresi
  if (filters.regionId && selectedRegion) {
    activeFilters.push({
      key: 'regionId', // regionId kaldırıldığında subRegionId de kaldırılır
      label: regionText,
      value: selectedRegion.name
    });
  }

  // Alt bölge filtresi
  if (filters.subRegionId && selectedSubRegion) {
    activeFilters.push({
      key: 'subRegionId',
      label: subRegionText,
      value: selectedSubRegion.name
    });
  }

  // Etiket filtreleri
  if (filters.tagIds?.length) {
    // 3'ten fazla etiket seçilmişse sadece sayıyı göster
    if (filters.tagIds.length > 3) {
      activeFilters.push({
        key: 'tagIds',
        label: featuresText,
        value: `${filters.tagIds.length} ${featureSelectedText}`
      });
    } else {
      // 1-3 etiket için isimleri göster
      const selectedTagNames = filters.tagIds
        .map((tagId) => {
          const foundTag = tags.find((tag) => tag.id === tagId);
          return foundTag?.name || tagId;
        })
        .join(', ');

      activeFilters.push({
        key: 'tagIds',
        label: featuresText,
        value: selectedTagNames
      });
    }
  }

  // Aktif filtre yoksa bileşeni render etme
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-4 sm:mb-6 lg:mb-8">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-700 mr-2">{activeFiltersText}</span>

        {activeFilters.map((filter) => (
          <Fragment key={filter.key + filter.value}>
            <span className="inline-flex items-center rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-300">
              <span>{filter.label}: {filter.value}</span>
              <button
                type="button"
                onClick={() => onRemove(filter.key)}
                className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:outline-none focus:bg-gray-500 focus:text-white"
                aria-label={`${removeFilterText}: ${filter.label} - ${filter.value}`}
              >
                <span className="sr-only">{`${removeFilterText}: ${filter.label} - ${filter.value}`}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3 w-3" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </Fragment>
        ))}

        {/* "Tüm Filtreleri Temizle" düğmesini yalnızca birden fazla filtre varsa göster */}
        {activeFilters.length > 1 && (
          <button
            type="button"
            className="text-xs text-blue-600 font-medium hover:text-blue-800 ml-2"
            onClick={onClear}
          >
            {clearAllFiltersText}
          </button>
        )}
      </div>
    </div>
  );
}
