'use client';

import React, { useState, useEffect } from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import LargeImage from '@/components/villa-kiralama/slug/gallery/LargeImage';
import SmallImage from '@/components/villa-kiralama/slug/gallery/SmallImage';
import FullScreenGallery from '@/components/villa-kiralama/slug/gallery/FullScreenGallery';

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

// Tipik olarak API'den gelebilecek görsel nesnelerini tanımlayan tip
type SourceImageType = {
  id?: string | number;
  villaId?: string | number;
  imageUrl?: string;
  title?: string | null;
  description?: string | null;
  altText?: string | null;
  order?: number | string;
  isCoverImage?: boolean;
  [key: string]: unknown; // Diğer olası alanları da kabul et
};

interface VillaGalleryProps {
  images?: SourceImageType[];
}

// Varsayılan placeholder görsel
const placeholderImage: VillaImage = {
  id: 'placeholder',
  villaId: 'placeholder',
  imageUrl: '/images/villa-placeholder.jpg',
  title: 'Villa Görseli',
  description: null,
  altText: 'Villa Görseli',
  order: 0,
  isCoverImage: true
};

export default function VillaGallery({ images }: VillaGalleryProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(16/9); // Mobil için varsayılan
  
  // Ekran boyutuna göre aspect ratio ayarla
  useEffect(() => {
    const updateAspectRatio = () => {
      if (window.innerWidth >= 1024) { // md breakpoint
        setAspectRatio(25/10); // Masaüstü
      } else if (window.innerWidth >= 640) { // sm breakpoint
        setAspectRatio(20/10); // Tablet
      } else {
        setAspectRatio(16/9); // Mobil
      }
    };
    
    // İlk yükleme ve ekran boyutu değiştiğinde güncelle
    updateAspectRatio();
    window.addEventListener('resize', updateAspectRatio);
    
    return () => {
      window.removeEventListener('resize', updateAspectRatio);
    };
  }, []);
  
  // Veri doğrulama & dönüştürme
  let validImages: VillaImage[] = [];
  
  try {
    if (Array.isArray(images) && images.length > 0) {
      // Veri içeri alınırken gerekli kontroller yapılır
      validImages = images.map(img => ({
        id: String(img.id || `img-${Math.random()}`),
        villaId: String(img.villaId || ''),
        imageUrl: String(img.imageUrl || '/images/villa-placeholder.jpg'),
        title: img.title || null,
        description: img.description || null,
        altText: img.altText || null,
        order: Number(img.order || 0),
        isCoverImage: Boolean(img.isCoverImage || false)
      }));
    } else {
      // Veri yoksa veya geçersizse varsayılan görsel ata
      validImages = [placeholderImage];
    }
  } catch (error) {
    console.error('Villa görselleri işlenirken hata:', error);
    validImages = [placeholderImage];
  }
  
  // Ana görsel ve küçük görseller
  const mainImage = validImages.find(img => img.isCoverImage) || validImages[0];
  const smallImages = validImages.filter(img => img.id !== mainImage.id).slice(0, 4);
  
  // Görsel tıklama işlemleri
  const handleMainImageClick = () => {
    setActiveImageIndex(0);
    setShowAllPhotos(true);
  };
  
  const handleSmallImageClick = (index: number) => {
    setActiveImageIndex(index + 1); // Ana görsel 0. indeks olduğu için +1
    setShowAllPhotos(true);
  };

  return (
    <div className="villa-gallery w-full mb-4 sm:mb-6 md:mb-8">
      {/* Aspect ratio dinamik olarak hesaplanıyor */}
      <AspectRatio ratio={aspectRatio} className="overflow-hidden">
        <div className={cn(
          "grid h-full w-full",
          smallImages.length > 0 
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3" 
            : "grid-cols-1"
        )}>
          {/* Ana büyük görsel - Sol kolon */}
          <div className={cn(
            "relative overflow-hidden rounded-lg", 
            smallImages.length > 0 
              ? "col-span-1 sm:col-span-1 md:col-span-2" 
              : "col-span-full"
          )}>
            <LargeImage 
              image={mainImage} 
              onClick={handleMainImageClick}
            />
          </div>
          
          {/* Küçük görseller grid - Mobil de dahil göster */}
          {smallImages.length > 0 && (
            <div className="grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3 col-span-1">
              {smallImages.map((image, index) => (
                <SmallImage 
                  key={image.id}
                  image={image}
                  index={index}
                  onClick={() => handleSmallImageClick(index)}
                  isLast={index === smallImages.length - 1}
                  totalCount={validImages.length}
                  remainingCount={validImages.length - 5}
                />
              ))}
            </div>
          )}
        </div>
      </AspectRatio>
      
      {/* Tam ekran galeri */}
      {showAllPhotos && (
        <FullScreenGallery 
          images={validImages}
          initialIndex={activeImageIndex}
          onClose={() => setShowAllPhotos(false)}
        />
      )}
    </div>
  );
} 