'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface VillaDescriptionProps {
  description?: string;
}

export default function VillaDescription({ description }: VillaDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Açıklama yoksa bileşeni gösterme
  if (!description) {
    return null;
  }
  
  // Daha kısa açıklama için 200 karakter sınırı
  const shortDescription = description.length > 200 
    ? `${description.substring(0, 200)}...` 
    : description;
  
  // Gösterilecek açıklama metnini belirle
  const displayText = isExpanded ? description : shortDescription;
  
  // Eğer açıklama 200 karakterden kısaysa "Daha Fazla" butonunu gösterme
  const showToggleButton = description.length > 200;

  return (
    <div className="villa-description">
      <h2 className="text-lg font-semibold mb-3 sm:mb-4">Villa Hakkında</h2>
      
      <div className="text-gray-600">
        <p className="text-sm sm:text-base leading-relaxed">{displayText}</p>
        
        {showToggleButton && (
          <Button 
            variant="link" 
            className="p-0 h-auto mt-2 text-primary text-sm sm:text-base hover:text-primary/90 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Daha Az Göster' : 'Daha Fazla Göster'}
          </Button>
        )}
      </div>
    </div>
  );
} 