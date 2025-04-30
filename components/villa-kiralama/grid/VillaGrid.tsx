'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Villa } from '@/types/villa';
import { VillaPagination } from '@/components/villa-kiralama/grid/VillaPagination';
import { VillaCard } from '@/components/villa-kiralama/VillaCard';

// Villa tipinin geliştirilmiş versiyonu - property tipleri hatalarını çözmek için
interface ExtendedVilla extends Villa {
  images?: Array<{ id: string; imageUrl: string; altText?: string; title?: string; isCoverImage?: boolean; order?: number }>;
  prices?: Array<{ nightlyPrice: number }>;
}

interface VillaGridProps {
  villas: ExtendedVilla[];
  loading: boolean;
  totalVillas: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  layout?: 'grid' | 'horizontal' | 'list';
}

export function VillaGrid({
  villas,
  loading,
  totalVillas,
  page,
  limit,
  onPageChange,
  layout = 'grid',
}: VillaGridProps) {
  // View type (grid/list)
  const [viewType, setViewType] = useState<'grid' | 'list'>(layout === 'list' ? 'list' : 'grid');

  // Total pages for pagination
  const totalPages = Math.ceil(totalVillas / limit);

  // Hardcoded texts (replacing dictionary lookups)
  const loadingText = 'Villalar yükleniyor...';
  const noResultsTitle = 'Villa Bulunamadı';
  const noResultsMessage = 'Kriterlerinize uygun villa bulunamadı. Lütfen filtrelerinizi genişletin veya farklı bir arama deneyin.';
  const gridViewText = 'Izgara görünümü';
  const listViewText = 'Liste görünümü';

  // Create status message based on data
  const getStatusMessage = () => {
    if (loading) {
      return loadingText;
    }

    if (villas.length === 0) {
      // Return empty string or a generic message if no results message is shown elsewhere
      return '';
    }

    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, totalVillas);
    const showingResultsText = `${totalVillas} villa içinden ${start}-${end} arası gösteriliyor`; 
    return showingResultsText;
  };

  // VillaImage bileşene gönderilecek formatta işle
  const prepareVillaForCard = (villa: ExtendedVilla): Villa => {
    // images bilgisinden imageUrl'leri çıkart
    const villaImages = villa.images?.map(img => img.imageUrl) || [];
    
    // Villa verisi ve villaImages'ı birleştir
    return {
      ...villa,
      villaImages
    } as unknown as Villa;
  };

  return (
    <div>
      {/* Top info bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <p className="text-sm text-gray-500 mb-2 sm:mb-0">
          {getStatusMessage()}
        </p>

        {/* View type buttons (only if not horizontal layout) */}
        {layout !== 'horizontal' && (
             <div className="flex space-x-2">
             <button
               type="button"
               onClick={() => setViewType('grid')}
               className={`p-2 rounded ${
                 viewType === 'grid'
                   ? 'bg-blue-50 text-blue-600'
                   : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
               }`}
               aria-label={gridViewText}
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
               </svg>
             </button>
             <button
               type="button"
               onClick={() => setViewType('list')}
               className={`p-2 rounded ${
                 viewType === 'list'
                   ? 'bg-blue-50 text-blue-600'
                   : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
               }`}
               aria-label={listViewText}
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
               </svg>
             </button>
           </div>
        )}

      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      )}

      {/* Villa list - No results message */}
      {!loading && villas.length === 0 && (
        <div className="text-center py-12 px-4 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{noResultsTitle}</h3>
          <p className="text-gray-500 mb-4">{noResultsMessage}</p>
        </div>
      )}

      {/* Villa list - Grid view (3 columns) */}
      {!loading && villas.length > 0 && viewType === 'grid' && layout === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {villas.map(villa => {
            const preparedVilla = prepareVillaForCard(villa);
            const villaImages = villa.images?.map(img => img.imageUrl) || [];
            
            return (
              <VillaCard
                key={villa.id}
                villa={preparedVilla}
                villaImages={villaImages}
              />
            );
          })}
        </div>
      )}

      {/* Villa list - Horizontal view (single row with 2 villas) */}
      {/* Note: Horizontal layout forces grid view type */}
      {!loading && villas.length > 0 && layout === 'horizontal' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {villas.map(villa => {
            const preparedVilla = prepareVillaForCard(villa);
            const villaImages = villa.images?.map(img => img.imageUrl) || [];
            
            return (
              <div key={villa.id} className="transition-transform duration-300 hover:-translate-y-1">
                <VillaCard
                  key={villa.id}
                  villa={preparedVilla}
                  villaImages={villaImages}
                />
              </div>
            );
          })}
        </div>
      )}


      {/* Villa list - List view */}
      {!loading && villas.length > 0 && viewType === 'list' && layout !== 'horizontal' && (
        <div className="space-y-4 sm:space-y-6">
          {villas.map(villa => {
            // Resim URL'lerini çıkart
            const imageUrls = villa.images?.map(img => img.imageUrl) || [];
            // İlk resim URL'sini al veya boş string kullan
            const firstImageUrl = imageUrls.length > 0 ? imageUrls[0] : '';
            
            return (
              <div key={villa.id} className="flex flex-col sm:flex-row border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="sm:w-1/3 relative h-48 sm:h-auto">
                  {firstImageUrl ? (
                    <Link href={`/villa-kiralama/${villa.slug}`}>
                      <Image
                        src={firstImageUrl}
                        alt={`${villa.title} görünümü`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </Link>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Resim yok</span>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6 sm:w-2/3 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/villa-kiralama/${villa.slug}`} className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                        {villa.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">{villa.mainRegion} - {villa.subRegion}</p>
                    </div>

                    {villa.isPromoted && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded">
                        Öne Çıkan
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 mt-2 line-clamp-2 text-sm">{villa.description}</p>

                  <div className="flex flex-wrap mt-3 gap-2">
                    <span className="inline-flex items-center text-xs text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {villa.bedrooms} Yatak Odası
                    </span>

                    <span className="inline-flex items-center text-xs text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Min {villa.minimumStay || 1} gece
                    </span>

                    <span className="inline-flex items-center text-xs text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {villa.maxGuests} Misafir
                    </span>
                  </div>

                  <div className="mt-auto pt-4 flex justify-between items-end">
                    <div>
                      {villa.prices && villa.prices.length > 0 && (
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {`₺${villa.prices[0].nightlyPrice.toLocaleString('tr-TR')}`}
                            <span className="text-sm font-normal text-gray-500"> / gece</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/villa-kiralama/${villa.slug}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Detayları Gör
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* Pagination */}
      {!loading && villas.length > 0 && totalPages > 1 && (
        <div className="mt-6 sm:mt-8">
          <VillaPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
