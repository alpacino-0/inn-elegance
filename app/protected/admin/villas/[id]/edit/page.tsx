'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import VillaForm from '@/app/protected/admin/_components/VillaForm';
import { useVillaById, useUpdateVilla } from '@/hooks/use-villa-queries';
import type { UpdateVillaDto } from '@/types/villa';

interface EditVillaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditVillaPage({ params }: EditVillaPageProps) {
  const resolvedParams = use(params);
  const villaId = resolvedParams.id;
  const router = useRouter();
  const { data: villaData, isLoading, isError, error: fetchError } = useVillaById(villaId);
  const updateVillaMutation = useUpdateVilla(villaId);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (formData: UpdateVillaDto) => {
    if (!villaId) {
      setError('Villa ID bulunamadı.');
      return;
    }
    
    setError(null);
    
    try {
      const response = await updateVillaMutation.mutateAsync(formData);
      
      if (response.error) {
        throw new Error(response.error.message || 'Villa güncellenirken bir hata oluştu');
      }
      
      if (response.data) {
        router.push(`/protected/admin/villas/${villaId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa güncellenirken bir hata oluştu');
      window.scrollTo(0, 0);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Villa bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  if (isError || !villaData?.data) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2 className="text-xl font-bold mb-2">Hata!</h2>
          <p>Villa bilgileri yüklenemedi. {fetchError?.message}</p>
          <button
            type="button"
            onClick={() => router.push('/protected/admin/villas')}
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Villa Listesine Dön
          </button>
        </div>
      </div>
    );
  }
  
  const villa = villaData.data;
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Villa Düzenle</h1>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">{villa.title}</span> villasını düzenliyorsunuz.
        </p>
        <p className="text-sm text-gray-500">
          ID: <span className="font-mono">{villa.id}</span>
        </p>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-medium">Hata!</p>
            <p>{error}</p>
          </div>
        )}
      </div>
      
      <VillaForm
        initialData={villa}
        onSubmit={handleSubmit}
        isSubmitting={updateVillaMutation.isPending}
      />
    </div>
  );
} 