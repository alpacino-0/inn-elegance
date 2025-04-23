import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { regionApi } from '@/utils/api-client';
import type { CreateVillaDto, Villa } from '@/types/villa';

// UI Bileşenleri
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Alt Bileşenler
import { GeneralInfoTab } from './GeneralInfoTab';
import { LocationTab } from './LocationTab';
import { FeaturesTab } from './FeaturesTab';
import { RulesTab } from './RulesTab';
import { PricingTab } from './PricingTab';
import { NotesTab } from './NotesTab';
import { AdvancedTab } from './AdvancedTab';
import type { FormHelpers } from './types';

// Bölgeleri yüklemek için hook
function useRegions(filter: { isMainRegion?: boolean; parentId?: string; isActive?: boolean } = {}) {
  return useQuery({
    queryKey: ['regions', filter],
    queryFn: () => regionApi.getRegions(filter),
    enabled: filter.parentId ? !!filter.parentId : true
  });
}

interface VillaFormProps {
  initialData?: Villa | null;
  onSubmit: (data: CreateVillaDto) => void;
  isSubmitting: boolean;
}

export default function VillaForm({ initialData, onSubmit, isSubmitting }: VillaFormProps) {
  const [formData, setFormData] = useState<CreateVillaDto>({
    title: '',
    description: '',
    slug: '',
    regionId: '',
    subRegionId: '',
    deposit: 0,
    cleaningFee: null,
    shortStayDayLimit: null,
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    checkInTime: '16:00',
    checkOutTime: '10:00',
    minimumStay: 3,
    rules: [],
    houseRules: [],
    tags: [],
    embedCode: null,
    status: 'ACTIVE',
    isPromoted: false,
    advancePaymentRate: 20,
    checkInNotes: null,
    checkOutNotes: null,
    cancellationNotes: null,
    managerId: null,
    translations: null,
  });

  // Dropdown verilerini yükleme
  const { data: mainRegionsData } = useRegions({ isMainRegion: true, isActive: true });
  const { data: subRegionsData, refetch: refetchSubRegions } = useRegions({ 
    parentId: formData.regionId, 
    isActive: true 
  });
  
  const mainRegions = mainRegionsData?.data || [];
  const subRegions = subRegionsData?.data || [];

  // Başlangıç verileri varsa formu doldur
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        slug: initialData.slug,
        regionId: initialData.regionId,
        subRegionId: initialData.subRegionId,
        deposit: initialData.deposit,
        cleaningFee: initialData.cleaningFee,
        shortStayDayLimit: initialData.shortStayDayLimit,
        bedrooms: initialData.bedrooms,
        bathrooms: initialData.bathrooms,
        maxGuests: initialData.maxGuests,
        checkInTime: initialData.checkInTime,
        checkOutTime: initialData.checkOutTime,
        minimumStay: initialData.minimumStay,
        rules: initialData.rules,
        houseRules: initialData.houseRules,
        tags: initialData.tags,
        embedCode: initialData.embedCode,
        status: initialData.status,
        isPromoted: initialData.isPromoted,
        advancePaymentRate: initialData.advancePaymentRate,
        checkInNotes: initialData.checkInNotes,
        checkOutNotes: initialData.checkOutNotes,
        cancellationNotes: initialData.cancellationNotes,
        managerId: initialData.managerId,
        translations: initialData.translations,
      });
    }
  }, [initialData]);

  // Bölge değiştiğinde alt bölgeleri yeniden yükle
  useEffect(() => {
    if (formData.regionId) {
      refetchSubRegions();
    }
  }, [formData.regionId, refetchSubRegions]);

  // Form verilerini güncelleyen fonksiyonları tanımlayalım
  const updateFormData = (newData: Partial<CreateVillaDto>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? null : Number(value)) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'regionId') {
      setFormData(prev => ({
        ...prev,
        regionId: value,
        subRegionId: '',
      }));
    } else if (name === 'subRegionId') {
      setFormData(prev => ({
        ...prev,
        subRegionId: value,
      }));
    } else if (name === 'status') {
      setFormData(prev => ({
        ...prev,
        status: value as 'ACTIVE' | 'INACTIVE' | 'PENDING',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleArrayChange = (name: string, value: string) => {
    const items = value ? value.split(',').map(item => item.trim()).filter(Boolean) : [];
    setFormData(prev => ({ ...prev, [name]: items }));
  };

  const handleTranslationsChange = (value: string) => {
    try {
      const parsedValue = value ? JSON.parse(value) : null;
      setFormData(prev => ({ ...prev, translations: parsedValue }));
    } catch (error) {
      console.error('JSON parse hatası:', error);
      // JSON parse hatası - burada bir hata mesajı gösterilebilir
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Bölge seçildiğindeki UI durumları
  const isRegionSelected = !!formData.regionId;
  const showSubRegionSelect = isRegionSelected && subRegions.length > 0;

  // Form yardımcı işlevlerini içeren nesneler
  const formHelpers: FormHelpers = {
    mainRegions,
    subRegions,
    isRegionSelected,
    showSubRegionSelect,
    handleInputChange,
    handleSelectChange,
    handleCheckboxChange,
    handleArrayChange,
    handleTranslationsChange,
    updateFormData,
    initialData
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4 w-full justify-start flex-wrap">
          <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
          <TabsTrigger value="location">Konum</TabsTrigger>
          <TabsTrigger value="features">Özellikler</TabsTrigger>
          <TabsTrigger value="rules">Kurallar</TabsTrigger>
          <TabsTrigger value="pricing">Fiyatlandırma</TabsTrigger>
          <TabsTrigger value="notes">Notlar</TabsTrigger>
          <TabsTrigger value="advanced">Gelişmiş</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralInfoTab formData={formData} helpers={formHelpers} />
        </TabsContent>

        <TabsContent value="location">
          <LocationTab 
            formData={formData} 
            helpers={formHelpers} 
          />
        </TabsContent>

        <TabsContent value="features">
          <FeaturesTab formData={formData} helpers={formHelpers} />
        </TabsContent>

        <TabsContent value="rules">
          <RulesTab formData={formData} helpers={formHelpers} />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingTab formData={formData} helpers={formHelpers} />
        </TabsContent>

        <TabsContent value="notes">
          <NotesTab formData={formData} helpers={formHelpers} />
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedTab formData={formData} helpers={formHelpers} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto"
        >
          {isSubmitting ? 'Kaydediliyor...' : initialData ? 'Değişiklikleri Kaydet' : 'Villa Ekle'}
        </Button>
      </div>
    </form>
  );
} 