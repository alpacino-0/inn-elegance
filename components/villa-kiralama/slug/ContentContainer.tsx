'use client';

import type { Villa } from "@/types/villa";
import LeftColumn from "@/components/villa-kiralama/slug/content/LeftColumn";
import RightColumn from "@/components/villa-kiralama/slug/content/RightColumn";
import VillaSupport from "@/components/villa-kiralama/slug/support/VillaSupport";

interface ContentContainerProps {
  villa: Villa;
}

export default function ContentContainer({ villa }: ContentContainerProps) {
  return (
    <div className="villa-content flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
      {/* Sağ Kolon - Rezervasyon formu - Mobilde üstte görünsün */}
      <div className="lg:col-span-4 order-1 lg:order-2 mb-4 lg:mb-0">
        <div className="lg:sticky lg:top-6 space-y-4">
          <RightColumn villa={villa} />
        </div>
      </div>
      
      {/* Sol Kolon - Ana içerik alanı */}
      <div className="lg:col-span-8 order-2 lg:order-1">
        <LeftColumn villa={villa} />
      </div>
      
      {/* VillaSupport - Mobilde her zaman en altta görünsün, masaüstünde sağ kolonda gösterilecek */}
      <div className="order-3 lg:hidden">
        <VillaSupport 
          villaId={villa.id}
          villaTitle={villa.title}
        />
      </div>
    </div>
  );
} 