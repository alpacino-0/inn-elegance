'use client';

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import VillaSpecs from "./VillaSpecs";
import VillaDescription from "./VillaDescription";
import VillaAmenities from "./VillaAmenities";

// VillaAmenity tipini veritabanı yapısına uygun olarak tanımlıyoruz
export interface VillaAmenity {
  id: string;
  villaId: string;
  name: string;
  icon: string | null;
  createdAt: string;
}

// Genişletilmiş VillaAmenity tipi, UI için ekstra özellikler içerir
export interface ExtendedVillaAmenity extends VillaAmenity {
  description?: string;
  category?: string;
}

// API'den dönen veri yapısını karşılamak için ek tür tanımlama
export type RelationalVillaAmenity = {
  villaId?: string;
  amenityId?: string;
  amenity: {
    id: string;
    name: string;
    icon?: string;
    category?: string;
  };
};

interface VillaInfoProps {
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  description?: string;
  amenities?: (ExtendedVillaAmenity | RelationalVillaAmenity)[];
}

export default function VillaInfo({ 
  bedrooms,
  bathrooms,
  maxGuests,
  description,
  amenities 
}: VillaInfoProps) {
  return (
    <Card className="overflow-hidden bg-white shadow-sm">
      <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Villa Özellikleri (Yatak, Banyo, Misafir) */}
        <VillaSpecs 
          bedrooms={bedrooms}
          bathrooms={bathrooms}
          maxGuests={maxGuests}
        />

        <Separator className="my-2 sm:my-4" />
        
        {/* Villa Açıklaması */}
        <VillaDescription description={description} />
        
        <Separator className="my-2 sm:my-4" />
        
        {/* Villa Olanakları */}
        <VillaAmenities amenities={amenities || []} />
      </CardContent>
    </Card>
  );
} 