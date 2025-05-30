'use client';

import { useRouter } from 'next/navigation';
import { use } from 'react';
import VillaDetail from '@/app/protected/admin/_components/VillaDetail';
import VillaAmenitiesManager from '@/app/protected/admin/_components/VillaAmenitiesManager';
import { VillaSeasonalPrices } from '@/app/protected/admin/_components/VillaSeasonalPrices';
import { VillaTagsSelector } from '@/app/protected/admin/_components/VillaTagsSelector';
import VillaAITab from '@/app/protected/admin/_components/VillaAITab';
import VillaImageUploader from '@/app/protected/admin/_components/VillaImageUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CalendarManager from '@/app/protected/admin/_components/CalendarManager';

interface VillaDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VillaDetailPage({ params }: VillaDetailPageProps) {
  const resolvedParams = use(params);
  const villaId = resolvedParams.id;
  const router = useRouter();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => router.push('/protected/admin/villas')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            role="img"
          >
            <title>Geri Dön</title>
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Villa Listesine Geri Dön
        </button>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Villa Detayı</TabsTrigger>
          <TabsTrigger value="images">Fotoğraflar</TabsTrigger>
          <TabsTrigger value="tags">Etiketler</TabsTrigger>
          <TabsTrigger value="amenities">Olanaklar</TabsTrigger>
          <TabsTrigger value="prices">Sezonsal Fiyatlar</TabsTrigger>
          <TabsTrigger value="calendar">Takvim</TabsTrigger>
          <TabsTrigger value="ai">AI İçerik Üretici</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <VillaDetail villaId={villaId} />
        </TabsContent>
        
        <TabsContent value="images">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Villa Fotoğrafları</h2>
            <VillaImageUploader 
              villaId={villaId} 
              onChange={(images) => console.log("Yüklenen fotoğraflar:", images)} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="tags">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Villa Etiketleri</h2>
            <VillaTagsSelector villaId={villaId} />
          </div>
        </TabsContent>
        
        <TabsContent value="amenities">
          <VillaAmenitiesManager villaId={villaId} />
        </TabsContent>
        
        <TabsContent value="prices">
          <VillaSeasonalPrices villaId={villaId} />
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarManager villaId={villaId} />
        </TabsContent>

        <TabsContent value="ai">
          <VillaAITab villaId={villaId} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 