'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from "@/lib/utils";

interface VillaImage {
  id: string;
  villaId: string;
  imageUrl: string;
  title: string | null;
  description: string | null;
  altText: string | null;
  order: number;
  isCoverImage: boolean;
}

interface LargeImageProps {
  image: VillaImage;
  onClick?: () => void;
}

export default function LargeImage({ image, onClick }: LargeImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Placeholder image kullanımı
  const placeholderImage = '/images/villa-placeholder.jpg';
  
  // Görsel URL'sini al (fallback ile)
  const imageUrl = image?.imageUrl || placeholderImage;
  const imageAlt = image?.title || image?.altText || 'Villa Ana Görseli';
  
  // Görsel yükleme tamamlandı
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  return (
    <div 
      className={cn(
        "relative w-full h-full cursor-pointer overflow-hidden rounded-lg group", 
        "transition-all duration-300 hover:shadow-md",
        onClick && "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-label={`${imageAlt} - Tıklayarak daha büyük görüntüle`}
    >
      {/* Loading durumu göstergesi */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      <Image 
        src={imageUrl}
        alt={imageAlt}
        fill
        className={cn(
          "object-cover transition-all duration-500 group-hover:scale-105",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        priority
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 70vw, (max-width: 1024px) 66vw, 50vw"
        onLoad={handleImageLoad}
      />
      
      {/* Mobil cihazlar için tıklama göstergesi - üzerine gelince görünen bir ikon eklenebilir */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
        <span className="sr-only">Daha büyük görüntülemek için tıklayın</span>
      </div>
    </div>
  );
} 