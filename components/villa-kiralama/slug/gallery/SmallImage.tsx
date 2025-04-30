'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

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

interface SmallImageProps {
  image: VillaImage;
  index: number;
  totalCount?: number;
  onClick?: () => void;
  isLast?: boolean;
  remainingCount?: number;
}

export default function SmallImage({ 
  image, 
  index, 
  totalCount = 0,
  onClick,
  isLast = false,
  remainingCount = 0
}: SmallImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Placeholder image kullanımı
  const placeholderImage = '/images/villa-placeholder.jpg';
  
  // Görsel URL'sini al (fallback ile)
  const imageUrl = image?.imageUrl || placeholderImage;
  const imageAlt = image?.title || image?.altText || `Villa Görseli ${index + 1}`;
  
  // Görsel yüklendiğinde
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  return (
    <Button 
      variant="ghost"
      className={cn(
        "relative p-0 h-full w-full overflow-hidden group",
        "rounded-lg",
        "focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
        "active:scale-95 transition-transform"
      )}
      onClick={onClick}
      aria-label={`${imageAlt} - Tıklayarak daha büyük görüntüle`}
    >
      {/* Loading durumu göstergesi */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-lg" />
      )}
      
      <Image 
        src={imageUrl}
        alt={imageAlt}
        fill
        className={cn(
          "object-cover transition-all duration-300 group-hover:scale-105 rounded-lg",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
        onLoad={handleImageLoad}
      />
      
      {/* Son görsel için overlay ve geri kalan fotoğraf sayısı */}
      {isLast && totalCount > 5 && remainingCount > 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity hover:bg-black/60 rounded-lg">
          <div className="text-white text-center">
            <p className="text-lg sm:text-xl md:text-2xl font-medium">+{remainingCount}</p>
            <p className="text-xs font-light">daha fazla</p>
          </div>
        </div>
      )}
      
      {/* Mobil için büyütme göstergesi */}
      {!isLast && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg">
          <Search className="text-white h-4 w-4 sm:h-5 sm:w-5 drop-shadow-md" />
        </div>
      )}
    </Button>
  );
} 