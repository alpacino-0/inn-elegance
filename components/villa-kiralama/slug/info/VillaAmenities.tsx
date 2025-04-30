'use client';

import React from 'react';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

// Villa Amenity tipini veritabanı şemasına uygun olarak tanımlayalım
interface VillaAmenity {
  id: string;
  villaId: string;
  name: string;
  icon: string | null;
  createdAt: string;
}

// Genişletilmiş VillaAmenity tipi, veritabanında olmayan ama UI'da kullanılabilecek alanlar ekleyelim
interface ExtendedVillaAmenity extends VillaAmenity {
  description?: string;
  category?: string;
}

// API'den dönen veri yapısını karşılamak için ek tür tanımlama
type RelationalVillaAmenity = {
  villaId?: string;
  amenityId?: string;
  amenity: {
    id: string;
    name: string;
    icon?: string;
    category?: string;
  };
};

interface VillaAmenitiesProps {
  amenities: (ExtendedVillaAmenity | RelationalVillaAmenity)[];
}

export default function VillaAmenities({ amenities }: VillaAmenitiesProps) {
  const [isShowingAll, setIsShowingAll] = useState(false);
  
  // Eğer olanaklar yoksa bileşeni gösterme
  if (!amenities || amenities.length === 0) {
    return null;
  }
  
  // Gösterilecek özellik sayısını belirle
  const limitCount = 6; // Mobil için daha az özellik göster
  const displayAmenities = isShowingAll ? amenities : amenities.slice(0, limitCount);
  const hasMoreAmenities = amenities.length > limitCount;

  // Amenity adını alma fonksiyonu
  const getAmenityName = (amenity: ExtendedVillaAmenity | RelationalVillaAmenity): string => {
    if ('amenity' in amenity && amenity.amenity) {
      return amenity.amenity.name;
    }
    return (amenity as ExtendedVillaAmenity).name || "";
  };

  // Her amenity için unique key oluştur
  const getAmenityKey = (amenity: ExtendedVillaAmenity | RelationalVillaAmenity, index: number): string => {
    if ('amenity' in amenity && amenity.amenity) {
      return `amenity-${amenity.amenity.id || index}`;
    }
    return `amenity-${(amenity as ExtendedVillaAmenity).id || index}`;
  };

  return (
    <div className="villa-amenities">
      <h2 className="text-lg font-semibold mb-3 sm:mb-4">Villa Olanakları</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 sm:gap-y-3 gap-x-4 mb-3 sm:mb-4">
        {displayAmenities.map((amenity, index) => (
          <div 
            key={getAmenityKey(amenity, index)} 
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-primary flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-sm text-gray-600">{getAmenityName(amenity)}</span>
          </div>
        ))}
      </div>
      
      {hasMoreAmenities && !isShowingAll && (
        <Button
          variant="link"
          className="text-primary p-0 h-auto text-sm sm:text-base hover:text-primary/90 transition-colors"
          onClick={() => setIsShowingAll(true)}
        >
          {amenities.length - limitCount} özellik daha göster
        </Button>
      )}
    </div>
  );
} 