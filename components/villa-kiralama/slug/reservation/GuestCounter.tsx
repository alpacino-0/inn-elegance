'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuestCounterProps {
  guestCount: number;
  onGuestCountChange: (count: number) => void;
  maxGuests: number;
  className?: string;
}

export default function GuestCounter({
  guestCount,
  onGuestCountChange,
  maxGuests,
  className
}: GuestCounterProps) {
  // Misafir sayısını azalt
  const decreaseGuests = () => {
    if (guestCount > 1) {
      onGuestCountChange(guestCount - 1);
    }
  };
  
  // Misafir sayısını artır
  const increaseGuests = () => {
    if (guestCount < maxGuests) {
      onGuestCountChange(guestCount + 1);
    }
  };
  
  return (
    <div className={cn("flex flex-wrap sm:flex-nowrap items-center justify-between gap-2", className)}>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm sm:text-base">Misafirler</div>
        <div className="text-xs sm:text-sm text-muted-foreground truncate">Maksimum {maxGuests} kişi</div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="outline" 
          size="icon" 
          className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border-gray-300 shadow-sm flex-shrink-0"
          onClick={decreaseGuests}
          disabled={guestCount <= 1}
          aria-label="Misafir sayısını azalt"
        >
          <MinusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <span className="w-5 text-center font-medium text-sm sm:text-base">{guestCount}</span>
        <Button
          type="button"
          variant="outline" 
          size="icon" 
          className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border-gray-300 shadow-sm flex-shrink-0"
          onClick={increaseGuests}
          disabled={guestCount >= maxGuests}
          aria-label="Misafir sayısını artır"
        >
          <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
} 