"use client";

import { useState, useEffect } from "react";
//import SearchBar from "../searchbar/SearchBar";

// HeroSection props tipini tanımlayalım
interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  backgroundImages?: {
    id: string;
    url: string;
  }[];
}

const HeroSection = ({
  title = "Eşsiz Tatil Deneyimleri İçin Lüks Villalar",
  subtitle = "Akdeniz ve Ege'nin en güzel koylarında unutulmaz bir tatil deneyimi için özel seçilmiş villalarımızı keşfedin.",
  backgroundImages = [
    {
      id: "villa-kiralama-1",
      url: "https://mfaexsxibqfwtpchkppy.supabase.co/storage/v1/object/public/villa-images/hero/villa-kiralama.jpg"
    },
    {
      id: "villa-kiralama-2",
      url: "https://mfaexsxibqfwtpchkppy.supabase.co/storage/v1/object/public/villa-images/hero/villa-kiralama-2.jpg"
    },
    {
      id: "villa-kiralama-3",
      url: "https://mfaexsxibqfwtpchkppy.supabase.co/storage/v1/object/public/villa-images/hero/villa-kiralama-3.jpg"
    },
  ],
}: HeroSectionProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Otomatik slider için useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Her 5 saniyede bir görsel değişecek

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <section className="relative h-[85vh] sm:h-screen w-full overflow-hidden">
      {/* Arka plan görselleri */}
      {backgroundImages.map((image, index) => (
        <div
          key={image.id}
          className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Gerçek görsel URL'lerini kullanıyoruz */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
            style={{ backgroundImage: `url('${image.url}')` }}
            aria-label={`Villa görsel ${index + 1}`}
          />
          
          {/* Görsel üzerindeki overlay (koyu efekt) */}
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ))}

      {/* Hero içeriği */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 sm:px-6 text-center">
        <div className="max-w-xl sm:max-w-2xl md:max-w-4xl">
          <h1 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white drop-shadow-lg">{title}</h1>
          <p className="mb-6 sm:mb-8 text-base sm:text-lg md:text-xl text-white drop-shadow-md">{subtitle}</p>
          
          {/* Arama çubuğu */}
          {/* <div className="mx-auto w-full max-w-3xl rounded-lg bg-white/10 p-4 backdrop-blur-md">
            <SearchBar />
          </div> */}
          
          {/* Slider göstergeleri */}
          <div className="mt-6 sm:mt-8 flex justify-center space-x-2">
            {backgroundImages.map((image, index) => (
              <button
                key={`indicator-${image.id}`}
                type="button"
                className={`h-1.5 sm:h-2 w-6 sm:w-8 rounded-full transition-colors ${
                  index === currentImageIndex
                    ? "bg-primary"
                    : "bg-white/50 hover:bg-white/80"
                }`}
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`Görsel ${index + 1}'e git`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;