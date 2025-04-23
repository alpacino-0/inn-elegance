'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VillaForm from '@/app/protected/admin/_components/VillaForm';
import { useCreateVilla } from '@/hooks/use-villa-queries';
import type { CreateVillaDto } from '@/types/villa';

export default function NewVillaPage() {
  const router = useRouter();
  const createVillaMutation = useCreateVilla();
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (formData: CreateVillaDto) => {
    setError(null);
    
    try {
      const response = await createVillaMutation.mutateAsync(formData);
      
      if (response.error) {
        throw new Error(response.error.message || 'Villa eklenirken bir hata oluştu');
      }
      
      if (response.data) {
        // Başarıyla oluşturuldu, detay sayfasına yönlendir
        router.push(`/protected/admin/villas/${response.data.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Villa eklenirken bir hata oluştu');
      window.scrollTo(0, 0); // Hata mesajını görmek için sayfanın en üstüne kaydır
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Yeni Villa Ekle</h1>
        <p className="text-gray-600">
          Yeni bir villa kaydı oluşturmak için aşağıdaki formu doldurunuz.
        </p>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p className="font-medium">Hata!</p>
            <p>{error}</p>
          </div>
        )}
      </div>
      
      <VillaForm
        onSubmit={handleSubmit}
        isSubmitting={createVillaMutation.isPending}
      />
    </div>
  );
} 