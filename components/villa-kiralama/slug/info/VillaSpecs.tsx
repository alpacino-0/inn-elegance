'use client';

import React from "react";
import { Bed, Bath, Users } from "lucide-react";

interface VillaSpecsProps {
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
}

export default function VillaSpecs({ 
  bedrooms, 
  bathrooms, 
  maxGuests 
}: VillaSpecsProps) {
  return (
    <div className="villa-specs">
      <h2 className="text-lg font-semibold mb-3 sm:mb-4">Villa Özellikleri</h2>
      
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Yatak Odaları */}
        <div className="flex flex-col items-center p-2 sm:p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
          <Bed className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-1.5 sm:mb-2" />
          <div className="text-xs sm:text-sm text-center">
            <span className="font-medium block">{bedrooms}</span>
            <span className="text-gray-600">{bedrooms === 1 ? 'Yatak Odası' : 'Yatak Odası'}</span>
          </div>
        </div>
        
        {/* Banyolar */}
        <div className="flex flex-col items-center p-2 sm:p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
          <Bath className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-1.5 sm:mb-2" />
          <div className="text-xs sm:text-sm text-center">
            <span className="font-medium block">{bathrooms}</span>
            <span className="text-gray-600">{bathrooms === 1 ? 'Banyo' : 'Banyo'}</span>
          </div>
        </div>
        
        {/* Maksimum Misafir */}
        <div className="flex flex-col items-center p-2 sm:p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-1.5 sm:mb-2" />
          <div className="text-xs sm:text-sm text-center">
            <span className="font-medium block">{maxGuests}</span>
            <span className="text-gray-600">{maxGuests === 1 ? 'Misafir' : 'Misafir'}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 