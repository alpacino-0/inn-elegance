'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { TouchEvent } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
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

interface FullScreenGalleryProps {
  images: VillaImage[];
  initialIndex?: number;
  onClose: () => void;
}

export default function FullScreenGallery({ 
  images, 
  initialIndex = 0,
  onClose 
}: FullScreenGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [loadingImage, setLoadingImage] = useState(true);
  
  // Placeholder image kullanımı
  const placeholderImage = '/images/villa-placeholder.jpg';
  
  // Görsel navigasyonu - useCallback ile memoize edilmiş fonksiyonlar
  const nextImage = useCallback(() => {
    setLoadingImage(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setLoadingImage(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  // Klavye olayları
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextImage, prevImage, onClose]);
  
  // Dokunmatik başlangıç
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  // Dokunmatik hareket
  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // Dokunmatik bırakma
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsSwiping(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (distance > minSwipeDistance) {
      nextImage();
    } else if (distance < -minSwipeDistance) {
      prevImage();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
  };
  
  // Resim yükleme tamamlandı
  const handleImageLoad = () => {
    setLoadingImage(false);
  };

  // Mevcut görsel
  const currentImage = images[currentIndex];
  const imageUrl = currentImage?.imageUrl || placeholderImage;
  const imageAlt = currentImage?.title || currentImage?.altText || `Villa Görseli ${currentIndex + 1}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
            e.preventDefault();
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Galeriyi kapat"
      />
      
      <div className="relative z-10 w-full h-full max-w-[90vw] max-h-[90vh] mx-auto flex flex-col">
        {/* Üst Bar */}
        <div className="flex items-center justify-between p-4">
          <span className="text-white text-sm">
            {currentIndex + 1} / {images.length}
          </span>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Görsel Konteyner */}
        <div 
          className="relative flex-1 w-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Yükleme Göstergesi */}
          {loadingImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* Görsel */}
          <div className={cn(
            "relative w-full h-full",
            isSwiping ? "cursor-grabbing" : "cursor-grab"
          )}>
            <Image 
              src={imageUrl}
              alt={imageAlt}
              fill
              className={cn(
                "object-contain transition-opacity duration-300",
                loadingImage ? "opacity-0" : "opacity-100"
              )}
              quality={90}
              priority
              onLoad={handleImageLoad}
              sizes="90vw"
            />
          </div>

          {/* Navigasyon Butonları */}
          <Button 
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-12 w-12"
            onClick={prevImage}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>

          <Button 
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-12 w-12"
            onClick={nextImage}
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Alt Bilgi */}
        <div className="p-4">
          <p className="text-white/80 text-sm text-center">
            {currentImage?.title || currentImage?.description || ''}
          </p>
        </div>
      </div>
    </div>
  );
} 