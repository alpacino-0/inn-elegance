'use client';

import React from "react";
import type { Villa } from "@/types/villa";
import type { SeasonalPrice } from "@/types/seasonal-price";
import VillaReservation from "@/components/villa-kiralama/slug/reservation/VillaReservation";
import VillaSupport from "@/components/villa-kiralama/slug/support/VillaSupport";

interface ExtendedVilla extends Villa {
  prices?: SeasonalPrice[];
}

interface RightColumnProps {
  villa: ExtendedVilla;
}

export default function RightColumn({ villa }: RightColumnProps) {
  return (
    <>
      {/* Rezervasyon Formu */}
      <VillaReservation 
        villaId={villa.id}
        nightlyPrice={villa.prices?.[0]?.nightlyPrice || 0}
        deposit={villa.deposit || 0}
        cleaningFee={villa.cleaningFee || 0}
        shortStayDayLimit={villa.shortStayDayLimit}
        minimumStay={villa.minimumStay}
        maxGuests={villa.maxGuests}
      />
      
      {/* Hızlı İletişim Formu - Sadece masaüstünde gösterilir, mobilde ContentContainer'da ayrıca gösterilecek */}
      <div className="hidden lg:block">
        <VillaSupport 
          villaId={villa.id}
          villaTitle={villa.title}
        />
      </div>
    </>
  );
} 