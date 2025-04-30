'use client';

import React from "react";
import { Separator } from "@/components/ui/separator";
import { MapPin } from "lucide-react";
import ShareButton from './header/ShareButton';
import type { Villa } from "@/types/villa";

interface VillaHeaderProps {
  title: string;
  villa?: Villa;
  location?: string;
}

export default function VillaHeader({ 
  title, 
  villa,
  location 
}: VillaHeaderProps) {
  // Konum bilgisini belirle: 
  // 1. Doğrudan location prop'u varsa onu kullan
  // 2. Villa nesnesi varsa mainRegion ve subRegion'ı kullan
  // 3. Hiçbir değer yoksa boş bir string kullan
  const displayLocation = location || 
    (villa?.mainRegion && villa?.subRegion 
      ? `${villa.mainRegion}, ${villa.subRegion}` 
      : villa?.mainRegion || villa?.subRegion || '');

  return (
    <header className="villa-header space-y-3 sm:space-y-4 mb-4 sm:mb-4 rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 space-y-1.5 sm:space-y-2 w-full">
          <div className="flex items-start justify-between">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-primary leading-tight line-clamp-2 pr-2">
              {title}
            </h1>
            
            <div className="flex sm:hidden space-x-2 items-center">
              <ShareButton title={title} />
            </div>
          </div>
          
          {displayLocation && (
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
              <span className="line-clamp-1">{displayLocation}</span>
            </div>
          )}
        </div>
        
        <div className="hidden sm:flex space-x-2 items-center sm:self-start">
          <ShareButton title={title} />
        </div>
      </div>
      
      <Separator className="bg-border/60 mt-2 sm:mt-4" />
    </header>
  );
} 