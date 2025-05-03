// pages/villalar.tsx
import { Suspense } from 'react';
import VillaListingContainer from '@/components/villa-kiralama/VillaListingContainer';
import { metadata } from './metadata'; // Metadata dosyasını içe aktarıyoruz

// Sayfanın kendi metadata tanımını kaldırıp, içe aktarılan metadata'yı kullanıyoruz
export { metadata };

// Villa Listeleme Sayfası
export default function VillaListPage() {
  return (
    <div className="py-8 px-4 sm:px-6 md:px-8 mx-auto max-w-7xl">
      <Suspense fallback={<div className="h-screen flex items-center justify-center">Yükleniyor...</div>}>
        <VillaListingContainer />
      </Suspense>
    </div>
  );
}
