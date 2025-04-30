'use client';

import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface VillaHighlightsProps {
  tags: string[];
}

export default function VillaHighlights({ tags }: VillaHighlightsProps) {
  // Etiket yoksa bileşeni gösterme
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="villa-highlights">
      <h2 className="text-lg font-semibold mb-4">Öne Çıkan Özellikler</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tags.map((tag, index) => (
          <div key={index} className="flex items-center gap-2">
            <Star className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm">{tag}</span>
          </div>
        ))}
      </div>
      
      <div className="flex flex-wrap gap-2 mt-4">
        {tags.map((tag, index) => (
          <Badge key={index} variant="outline" className="bg-primary/5 hover:bg-primary/10">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
} 