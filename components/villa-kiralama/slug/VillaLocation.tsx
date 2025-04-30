'use client';

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface VillaLocationProps {
  mainRegion: string;
  subRegion: string;
  mapUrl?: string | null;
  embedCode?: string | null;
}

export default function VillaLocation({
  mainRegion,
  subRegion,
  mapUrl,
  embedCode
}: VillaLocationProps) {
  // Çevre değişkenlerinden API anahtarını al
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  
  // Sadece güvenilir harita URL'ler için iframe oluştur
  const renderMap = () => {
    // mapUrl varsa direkt olarak onu kullan ve API anahtarını ekle
    if (mapUrl) {
      const url = new URL(mapUrl);
      // URL'de zaten API anahtarı yoksa ekle
      if (!url.searchParams.has('key') && apiKey) {
        url.searchParams.append('key', apiKey);
      }
      
      return (
        <iframe
          src={url.toString()}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Villa Konum Haritası"
        />
      );
    }
    
    // Eğer embedCode varsa, sadece Google Maps veya güvenilir kaynakları kabul et
    if (embedCode) {
      // Güvenli kaynaklar
      const trustedSources = [
        "maps.google.com",
        "www.google.com/maps",
        "maps.googleapis.com"
      ];
      
      // Basit kaynak kontrolü
      const isTrustedSource = trustedSources.some(source => 
        embedCode?.includes(source)
      );
      
      if (isTrustedSource) {
        // Regex ile src URL'ini çıkart
        const srcMatch = embedCode.match(/src=["'](https:\/\/[^"']+)["']/);
        
        if (srcMatch?.[1]) {
          let src = srcMatch[1];
          
          // API anahtarı ekle (eğer yoksa)
          if (apiKey && !src.includes('key=')) {
            src += `${src.includes('?') ? '&' : '?'}key=${apiKey}`;
          }
          
          return (
            <iframe
              src={src}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Villa Konum Haritası"
            />
          );
        }
      }
    }
    
    // Harita yok veya güvenli değil
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Harita bilgisi bulunmamaktadır.</p>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden bg-white shadow-sm mb-6 sm:mb-8">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-lg sm:text-xl">Konum</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="flex items-start sm:items-center gap-2">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 sm:mt-0 flex-shrink-0" />
          <div>
            <p className="text-sm sm:text-base font-medium">{mainRegion}, {subRegion}</p>
            <p className="text-xs sm:text-sm text-gray-500">Tam konum bilgisi rezervasyon sonrası paylaşılacaktır.</p>
          </div>
        </div>
        
        {/* Harita */}
        <div className="w-full h-[250px] sm:h-[300px] md:h-[400px] rounded-lg overflow-hidden border">
          {renderMap()}
        </div>
        
        <div className="space-y-1 sm:space-y-2 mt-2 sm:mt-4">
          <h3 className="text-sm sm:text-base font-medium">Bölge Bilgisi</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {mainRegion} bölgesi, güzel plajları ve pitoresk köyleriyle ünlüdür. Bölgede birçok restoran, kafe ve alışveriş noktası bulunmaktadır. Villadan merkeze arabayla yaklaşık 15 dakika uzaklıktadır.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 