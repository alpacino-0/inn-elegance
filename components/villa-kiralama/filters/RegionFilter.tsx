'use client';

import { useState, useEffect } from 'react';
import type { RegionOption } from '@/types/filter';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Dictionary tipini tanımla
interface Dictionary {
  villaListing?: {
    filters?: {
      regionSelect?: string;
      allRegions?: string;
      loading?: string;
      noResults?: string;
      selectRegion?: string;
      selectSubRegion?: string;
      [key: string]: string | undefined;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface RegionFilterProps {
  regions: RegionOption[];
  selectedRegionId?: string;
  selectedSubRegionId?: string;
  isLoading?: boolean;
  onChange: (regionId?: string, subRegionId?: string) => void;
  dictionary?: Dictionary;
  className?: string;
}

export function RegionFilter({
  regions,
  selectedRegionId,
  selectedSubRegionId,
  isLoading = false,
  onChange,
  dictionary,
  className
}: RegionFilterProps) {
  // Seçili bölgenin alt bölgelerini tutan state
  const [subRegions, setSubRegions] = useState<RegionOption['subRegions']>([]);

  // Dictionary'den metinleri al veya varsayılan değerleri kullan
  const filtersDict = dictionary?.villaListing?.filters || {};
  
  const regionSelectText = filtersDict.regionSelect || 'Bölge seçin';
  const allRegionsText = filtersDict.allRegions || 'Tüm Bölgeler';
  const selectSubRegionText = filtersDict.selectSubRegion || 'Alt bölge seçin';

  // selectedRegionId değiştiğinde subRegions'ı güncelle
  useEffect(() => {
    if (selectedRegionId) {
      const region = regions.find(r => r.id === selectedRegionId);
      setSubRegions(region?.subRegions || []);
    } else {
      setSubRegions([]);
    }
  }, [selectedRegionId, regions]);

  // Ana bölge değiştiğinde
  const handleRegionChange = (value: string) => {
    // "all" değeri tüm bölgeler anlamında kullanılıyor
    if (value === "all") {
      onChange(undefined, undefined);
      return;
    }
    
    onChange(value, undefined);
  };

  // Alt bölge değiştiğinde
  const handleSubRegionChange = (value: string) => {
    onChange(selectedRegionId, value);
  };

  // Alt bölgeler var mı kontrol et
  const hasSubRegions = selectedRegionId && subRegions && subRegions.length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Ana Bölge Seçici */}
      <Select
        value={selectedRegionId || "all"}
        onValueChange={handleRegionChange}
        disabled={isLoading}
      >
        <SelectTrigger className={cn(
          "w-full bg-background h-auto min-h-10",
          "border-border text-foreground shadow-sm",
          "hover:border-accent/50 hover:bg-muted/30 transition-colors",
          "font-nunito"
        )}>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent shrink-0" />
            <SelectValue placeholder={regionSelectText} />
          </div>
        </SelectTrigger>
        <SelectContent position="popper" className="bg-card text-card-foreground border-border">
          <SelectItem value="all" className="cursor-pointer">
            {allRegionsText}
          </SelectItem>
          
          {regions.map((region) => (
            <SelectItem 
              key={region.id} 
              value={region.id}
              className="cursor-pointer font-medium"
            >
              {region.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Alt Bölge Seçici - Eğer bir ana bölge seçilmişse ve alt bölgeleri varsa göster */}
      {hasSubRegions && (
        <Select
          value={selectedSubRegionId}
          onValueChange={handleSubRegionChange}
          disabled={isLoading}
        >
          <SelectTrigger className={cn(
            "w-full bg-background h-auto min-h-10",
            "border-border text-foreground shadow-sm",
            "hover:border-accent/50 hover:bg-muted/30 transition-colors",
            "font-nunito"
          )}>
            <SelectValue placeholder={selectSubRegionText} />
          </SelectTrigger>
          <SelectContent position="popper" className="bg-card text-card-foreground border-border">
            {subRegions?.map((subRegion) => (
              <SelectItem 
                key={subRegion.id} 
                value={subRegion.id}
                className="cursor-pointer"
              >
                {subRegion.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
} 