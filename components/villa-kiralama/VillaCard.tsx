'use client';

import { useState, useCallback, useMemo, type TouchEvent, memo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Villa } from '@/types/villa';
import type { VillaImage } from '@/types/villa-image';
import { 
  Users, 
  BedDouble, 
  Bath, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  InfoIcon 
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMinimumSeasonalPrice } from '@/hooks/useMinimumSeasonalPrice';

// Constants
const MIN_SWIPE_DISTANCE = 50;
const MAX_INDICATOR_DOTS = 3;
const PLACEHOLDER_IMAGE = '/images/villa-placeholder.jpg';

// Villa görselleri için yardımcı tip tanımı - ya string URL ya da VillaImage nesnesi
type VillaImageType = string | VillaImage;

interface VillaCardProps {
  villa: Villa;
  // locale parametresini kaldırın veya yorum satırına alın
  // locale?: string;
  price?: number; // Manuel verilen fiyat (opsiyonel)
  isLoading?: boolean;
  isImageLoading?: boolean;
  coverImage?: string;
  villaImages?: VillaImageType[]; // Villa görselleri dizisi (opsiyonel)
}

// İkon + metin özellik bileşeni
interface FeatureItemProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}

const FeatureItem = memo(({ icon, value, label }: FeatureItemProps) => (
  <div className="flex items-center gap-1.5" title={label}>
    <span className="text-accent">{icon}</span>
    <span className="text-sm">{value} {label}</span>
  </div>
));
FeatureItem.displayName = 'FeatureItem';

// Villa özellikleri bileşeni
interface VillaFeaturesProps {
  villa: Villa;
}

const VillaFeatures = memo(({ villa }: VillaFeaturesProps) => {
  // Sabit metinler
  const kisilikText = 'Kişilik';
  const yatakOdasiText = 'Yatak Odası';
  const banyoText = 'Banyo';

  return (
    <div className="flex items-center justify-between bg-muted/60 p-2 rounded-md text-card-foreground font-medium text-sm">
      <FeatureItem 
        icon={<Users className="w-4 h-4" />} 
        value={villa.maxGuests || 0} 
        label={kisilikText} 
      />
      <FeatureItem 
        icon={<BedDouble className="w-4 h-4" />} 
        value={villa.bedrooms || 0} 
        label={yatakOdasiText} 
      />
      <FeatureItem 
        icon={<Bath className="w-4 h-4" />} 
        value={villa.bathrooms || 0} 
        label={banyoText} 
      />
    </div>
  );
});
VillaFeatures.displayName = 'VillaFeatures';

// Fiyat görüntüleme bileşeni
interface PriceDisplayProps {
  price: number | null;
  isLoading: boolean;
  isDateRangeSelected?: boolean;
}

const PriceDisplay = memo(({ price, isLoading, isDateRangeSelected = false }: PriceDisplayProps) => {
  // Sabit metinler
  const fiyatYukleniyorText = 'Fiyat yükleniyor...';
  const baslayanText = 'den başlayan';
  const fiyatlarlaText = 'fiyatlarla';
  const geceText = 'gece';
  const fiyatMevcutText = 'Fiyat bilgisi mevcut değil';
  const fiyatDegisiklikText = 'Seçilen tarihler için fiyatlar değişiklik gösterebilir.';

  return (
    <div className="font-semibold text-accent text-base">
      {isLoading ? (
        <span className="text-sm text-muted-foreground">{fiyatYukleniyorText}</span>
      ) : price ? (
        <>
          {new Intl.NumberFormat('tr-TR', { 
            style: 'currency', 
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(price)}
          <span className="text-sm text-muted-foreground ml-1 font-medium">
            <span className="hidden sm:inline-block">{baslayanText} {fiyatlarlaText}</span>
            <span className="inline-block sm:hidden">/{geceText}</span>
          </span>
        </>
      ) : (
        <span className="text-sm text-muted-foreground">{fiyatMevcutText}</span>
      )}
      
      {isDateRangeSelected && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className="w-4 h-4 ml-1 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              {fiyatDegisiklikText}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
});
PriceDisplay.displayName = 'PriceDisplay';

// Resim göstergeci (indikatörler)
interface ImageIndicatorsProps {
  totalImages: number;
  activeIndex: number;
  villaId: string;
}

const ImageIndicators = memo(({ totalImages, activeIndex, villaId }: ImageIndicatorsProps) => {
  if (totalImages <= 1) return null;
  
  // Sabit metinler
  const aktifGorselText = 'Aktif görsel grubu';
  const gorselText = 'Görsel grubu';
  
  let totalDots = totalImages;
  if (totalDots > MAX_INDICATOR_DOTS) totalDots = MAX_INDICATOR_DOTS;
  
  // Kaçıncı grubun gösterildiğini hesapla
  const groupSize = Math.ceil(totalImages / totalDots);
  const currentGroup = Math.floor(activeIndex / groupSize);
  
  return (
    <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1.5">
      {Array.from({ length: totalDots }).map((_, index) => {
        const isActive = (index === currentGroup);
        return (
          <div 
            key={`indicator-${villaId}-${index}-${isActive ? 'active' : 'inactive'}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              isActive ? 'bg-white w-4' : 'bg-white/60 w-1.5'
            }`}
            aria-label={isActive
              ? aktifGorselText 
              : `${gorselText} ${index + 1}`}
          />
        );
      })}
    </div>
  );
});
ImageIndicators.displayName = 'ImageIndicators';

// Resim slider kontrollerini gösteren bileşen
interface ImageControlsProps {
  totalImages: number;
  onPrev: () => void;
  onNext: () => void;
}

const ImageControls = memo(({ totalImages, onPrev, onNext }: ImageControlsProps) => {
  if (totalImages <= 1) return null;
  
  // Sabit metinler
  const oncekiGorselText = 'Önceki görsel';
  const sonrakiGorselText = 'Sonraki görsel';
  
  const buttonStyles = "absolute top-1/2 -translate-y-1/2 bg-white/80 text-accent p-1 rounded-full hover:bg-accent hover:text-white transition-colors w-8 h-8 flex items-center justify-center backdrop-blur-sm border-none shadow-md z-10";
  
  return (
    <>
      <Button 
        type="button"
        variant="outline"
        size="icon"
        className={`${buttonStyles} left-2`}
        onClick={(e) => { e.preventDefault(); onPrev(); }}
        aria-label={oncekiGorselText}
      >
        <ChevronLeft size={16} />
      </Button>
      <Button 
        type="button"
        variant="outline"
        size="icon"
        className={`${buttonStyles} right-2`}
        onClick={(e) => { e.preventDefault(); onNext(); }}
        aria-label={sonrakiGorselText}
      >
        <ChevronRight size={16} />
      </Button>
    </>
  );
});
ImageControls.displayName = 'ImageControls';

// Optimize edilmiş resim bileşeni
interface OptimizedImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

const OptimizedImage = memo(({ src, alt, priority = false }: OptimizedImageProps) => {
  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        quality={80}
      />
    </div>
  );
});
OptimizedImage.displayName = 'OptimizedImage';

// Resim slider bileşeni
interface ImageSliderProps {
  images: string[];
  activeIndex: number;
  villaId: string;
  villaTitle: string;
  isLoading: boolean;
  featuredTag: string | null;
  onPrev: () => void;
  onNext: () => void;
  onTouchStart: (e: TouchEvent<HTMLDivElement>) => void;
  onTouchMove: (e: TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: () => void;
  isSwiping: boolean;
}

const ImageSlider = memo(({ 
  images, 
  activeIndex, 
  villaId,
  villaTitle,
  isLoading, 
  featuredTag,
  onPrev,
  onNext,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  isSwiping
}: ImageSliderProps) => {
  const aspectRatioStyles = {
    aspectRatio: '4/3',
    padding: 0,
    margin: 0,
    lineHeight: 0
  };
  
  const resetTextSpacingStyles = {
    fontSize: 0
  };

  // Sabit metinler
  const swipeInfoText = 'Villa görselleri galerisi, kaydırarak gezinebilirsiniz';
  const yukleniyorText = 'Yükleniyor...';

  // Görüntüleri önceden yükle
  useEffect(() => {
    if (images.length > 1) {
      const nextIndex = (activeIndex + 1) % images.length;
      const prevIndex = (activeIndex - 1 + images.length) % images.length;
      
      const preloadImage = (src: string) => {
        const img = new globalThis.Image();
        img.src = src;
      };
      
      preloadImage(images[nextIndex]);
      preloadImage(images[prevIndex]);
    }
  }, [activeIndex, images]);
  
  return (
    <div className="relative w-full block" style={aspectRatioStyles}>
      <div 
        className={`absolute inset-0 ${isSwiping ? 'cursor-grabbing' : 'cursor-grab'} bg-muted overflow-hidden`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        aria-label={swipeInfoText}
        aria-roledescription="slider"
        aria-valuemin={0}
        aria-valuemax={images.length - 1}
        aria-valuenow={activeIndex}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            onPrev();
            e.preventDefault();
          } else if (e.key === 'ArrowRight') {
            onNext();
            e.preventDefault();
          }
        }}
        style={resetTextSpacingStyles}
      >
        <ImageIndicators 
          totalImages={images.length} 
          activeIndex={activeIndex} 
          villaId={villaId}
        />
      
        {featuredTag && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-accent text-accent-foreground px-3 py-1 text-xs font-semibold">
              {featuredTag}
            </Badge>
          </div>
        )}
        
        {isLoading ? (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
            <span className="text-muted-foreground text-base">{yukleniyorText}</span>
          </div>
        ) : (
          <div className="absolute inset-0 transition-opacity duration-300">
            <OptimizedImage 
              src={images[activeIndex]} 
              alt={`${villaTitle} - ${activeIndex + 1}/${images.length}`}
              priority={activeIndex === 0}
            />
          </div>
        )}
        
        <ImageControls 
          totalImages={images.length} 
          onPrev={onPrev} 
          onNext={onNext}
        />
      </div>
    </div>
  );
});
ImageSlider.displayName = 'ImageSlider';

/**
 * Görsel sıralama yardımcı fonksiyonu
 * Görselleri kapak görseli ve sıralama değerine göre düzenler
 */
const sortVillaImages = (images: VillaImageType[]): VillaImageType[] => {
  if (!Array.isArray(images) || images.length <= 1) return images;
  
  return [...images].sort((a, b) => {
    // Her iki eleman da obje tipindeyse
    if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
      // Eğer a kapak görseli ise, a'yı en başa al
      if (a.isCoverImage && !b.isCoverImage) return -1;
      // Eğer b kapak görseli ise, b'yi en başa al
      if (!a.isCoverImage && b.isCoverImage) return 1;
      // Her ikisi de kapak veya kapak değilse, order'a göre sırala
      return (a.order || 0) - (b.order || 0);
    }
    // Obje olmayanları olduğu gibi bırak
    return 0;
  });
};

/**
 * Villa Kartı Bileşeni
 * 
 * Her bir villa için bilgileri gösteren gelişmiş kart bileşeni.
 * - Çoklu fotoğraf desteği ve kaydırma özelliği
 * - Villa etiketleri ve konum bilgisi
 * - Duyarlı ve erişilebilir arayüz
 * - Sezonsal en düşük fiyat gösterimi
 * - Görselleri 'order' alanına göre sıralama ve kapak görseli önceliği
 */
export const VillaCard = memo(({ 
  villa, 
  // locale = 'tr', // Bu satırı kaldırın veya yorum satırına alın
  price: manualPrice,
  isLoading: manualLoading = false,
  isImageLoading = false,
  coverImage,
  villaImages
}: VillaCardProps) => {
  // State tanımlamaları
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  
  // En düşük sezon fiyatını getir
  const { 
    data: minSeasonalPrice, 
    isLoading: isSeasonalPriceLoading 
  } = useMinimumSeasonalPrice(villa.id);
  
  // Sabit metinler
  const bolgeText = 'Bölge';
  const detaylariGorText = 'Detayları Gör';
  
  // Villa için fiyat değerini belirle
  const villaPrice = useMemo(() => {
    // 1. Öncelikle manuel olarak props'tan gelen fiyatı kontrol et
    if (manualPrice !== undefined) return manualPrice;
    
    // 2. Mevcutsa, sezonsal en düşük fiyatı kullan
    if (minSeasonalPrice !== null && minSeasonalPrice !== undefined) {
      return minSeasonalPrice;
    }
    
    // 3. Hiçbiri yoksa, deposit değerini varsayılan olarak kullan
    return villa.deposit;
  }, [villa, manualPrice, minSeasonalPrice]);
  
  // Fiyat yüklenme durumunu belirle
  const isLoading = manualLoading || isSeasonalPriceLoading;
  
  // Görsel dizisini hazırla
  const imagesArray = useMemo(() => {
    // Eğer props'tan villaImages geldiyse, onu kullan ve sırala
    if (villaImages && Array.isArray(villaImages) && villaImages.length > 0) {
      return sortVillaImages(villaImages);
    } 
    
    // Eğer coverImage props'u varsa onu tek elemanlı dizi olarak kullan
    if (coverImage) {
      return [coverImage];
    }
    
    // Hiçbiri yoksa boş dizi döndür
    return [];
  }, [villaImages, coverImage]);
  
  // Image URL'lerini hazırla
  const imageUrls = useMemo(() => {
    if (!imagesArray.length) return [];
    
    // Görsel URL'leri hazırla ve boş/geçersiz değerleri filtrele
    return imagesArray
      .map((img: VillaImageType) => {
        if (!img) return null;
        
        // String tipinde ise doğrudan URL olarak al
        if (typeof img === 'string') return img;
        
        // Obje tipinde ise, imageUrl özelliğini kullan
        if (img.imageUrl) return img.imageUrl;
        
        // Geçerli URL bulunamadı
        return null;
      })
      .filter(Boolean) as string[]; // null/undefined değerlerini filtrele
  }, [imagesArray]);
  
  // Eğer hiç resim yoksa placeholder kullan
  const finalImageUrls = useMemo(() => {
    return imageUrls.length > 0 ? imageUrls : [PLACEHOLDER_IMAGE];
  }, [imageUrls]);
  
  // Resim geçişi fonksiyonları
  const nextImage = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % finalImageUrls.length);
  }, [finalImageUrls.length]);
  
  const prevImage = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + finalImageUrls.length) % finalImageUrls.length);
  }, [finalImageUrls.length]);
  
  // Dokunmatik olayları
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (finalImageUrls.length <= 1) return; // Tek resim varsa kaydırma işlevini devre dışı bırak
    
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  }, [finalImageUrls.length]);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!touchStart || finalImageUrls.length <= 1) return;
    
    setTouchEnd(e.targetTouches[0].clientX);
  }, [touchStart, finalImageUrls.length]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || finalImageUrls.length <= 1) {
      setIsSwiping(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    
    if (distance > MIN_SWIPE_DISTANCE) {
      // Sola kaydırma (sonraki resim)
      nextImage();
    } else if (distance < -MIN_SWIPE_DISTANCE) {
      // Sağa kaydırma (önceki resim)
      prevImage();
    }
    
    // Dokunmatik değerlerini sıfırla
    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
  }, [touchStart, touchEnd, finalImageUrls.length, nextImage, prevImage]);

  // Villa etiketlerini al
  const tags = useMemo(() => {
    if (!Array.isArray(villa.tags)) return [];
    
    // Tags string dizisi olarak geliyorsa doğrudan kullan
    if (villa.tags.length > 0 && typeof villa.tags[0] === 'string') {
      return villa.tags as string[];
    }
    
    // Tag yapısı karmaşık olabilir, güvenli bir şekilde işleme
    return villa.tags
      .map(tag => {
        // typeof kontrolleri ile tag bilgisini çıkar
        if (typeof tag === 'string') return tag;
        if (typeof tag !== 'object' || tag === null) return '';
        
        // VillaTag->Tag ilişkisi
        const tagObject = tag as Record<string, unknown>;
        if ('Tag' in tagObject && tagObject.Tag && typeof tagObject.Tag === 'object') {
          const nestedTag = tagObject.Tag as Record<string, unknown>;
          return typeof nestedTag.name === 'string' ? nestedTag.name : '';
        }
        
        // Doğrudan Tag nesnesi
        if ('name' in tagObject && typeof tagObject.name === 'string') {
          return tagObject.name;
        }
        
        return '';
      })
      .filter(Boolean); // Boş string'leri filtrele
  }, [villa.tags]);
  
  // Öne çıkan tag (varsa ilk tag)
  const featuredTag = useMemo(() => {
    return tags.length > 0 ? tags[0] : null;
  }, [tags]);
  
  const zeroPaddingStyles = { lineHeight: 0, fontSize: 0 };
  
  // İmajların yüklenme durumu için debugger bilgisi
  useEffect(() => {
    // Development modda, imaj dizisindeki potansiyel sorunları tespit etmek için konsol bildirimi
    if (process.env.NODE_ENV === 'development' && !finalImageUrls.length) {
      console.warn(
        `VillaCard: ${villa.title} (${villa.id}) için hiç görsel bulunamadı. Varsayılan görsel kullanılıyor.`
      );
    }
  }, [finalImageUrls, villa.id, villa.title]);
  
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-card border-border shadow-sm h-full p-0">
      {/* Resim slider */}
      <div className="w-full overflow-hidden p-0 m-0" style={zeroPaddingStyles}>
        <ImageSlider 
          images={finalImageUrls}
          activeIndex={activeIndex}
          villaId={villa.id}
          villaTitle={villa.title}
          isLoading={isImageLoading}
          featuredTag={featuredTag}
          onPrev={prevImage}
          onNext={nextImage}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          isSwiping={isSwiping}
        />
      </div>
      
      <div className="flex flex-col flex-grow justify-between">
        <div>
          <CardHeader className="px-3 py-2 pt-2.5 pb-1">
            {/* Villa adı ve bölge bilgisi */}
            <CardTitle className="text-xl font-semibold text-card-foreground mb-0.5 line-clamp-1 font-montserrat">
              {villa.title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground font-medium font-nunito flex items-center">
              <MapPin size={14} className="text-accent mr-1.5 flex-shrink-0" />
              <span className="truncate">
                {villa.mainRegion && villa.subRegion 
                  ? `${villa.mainRegion}, ${villa.subRegion}`
                  : villa.mainRegion || villa.subRegion || bolgeText}
              </span>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-3 pt-0 pb-2">
            {/* Özellikler - tek satırda */}
            <VillaFeatures villa={villa} />
          </CardContent>
        </div>
         
        <CardFooter className="px-3 py-2 flex items-center justify-between border-t border-border mt-1">
          <PriceDisplay 
            price={villaPrice} 
            isLoading={isLoading}
            isDateRangeSelected={false}
          />
          
          <Button 
            asChild
            variant="default"
            size="sm"
            className="bg-accent hover:bg-accent/90 text-accent-foreground py-1.5 px-3.5 rounded text-sm font-medium transition-colors h-8"
          >
            <Link href={`/villa-kiralama/${villa.slug}`}>
              {detaylariGorText}
            </Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
});
VillaCard.displayName = 'VillaCard';
