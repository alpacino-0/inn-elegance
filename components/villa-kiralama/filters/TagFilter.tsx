'use client';

import { useState } from 'react';
import type { FilterOption } from '@/types/filter';
import { Tag, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

// Dictionary tipini tanımla
interface Dictionary {
  villaListing?: {
    filters?: {
      features?: string;
      noFeatures?: string;
      apply?: string;
      clear?: string;
      featuresSelected?: string;
      selectFeatures?: string;
      selectedFeatures?: string;
      [key: string]: string | undefined;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface TagFilterProps {
  tags: FilterOption[];
  selectedTagIds: string[];
  isLoading?: boolean;
  onChange: (tagIds: string[]) => void;
  dictionary?: Dictionary;
  className?: string;
}

export function TagFilter({
  tags,
  selectedTagIds,
  isLoading = false,
  onChange,
  dictionary,
  className
}: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Dictionary'den metinleri al veya varsayılan değerleri kullan
  const filtersDict = dictionary?.villaListing?.filters || {};
  
  const noFeaturesText = filtersDict.noFeatures || 'Hiç özellik bulunamadı';
  const applyText = filtersDict.apply || 'Uygula';
  const clearText = filtersDict.clear || 'Temizle';
  const featuresSelectedText = filtersDict.featuresSelected || 'özellik seçildi';
  const selectFeaturesText = filtersDict.selectFeatures || 'Villa özellikleri seçin';
  const selectedFeaturesText = filtersDict.selectedFeatures || 'Seçili Özellikler';

  // Etiket seçimini değiştirme
  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };
  
  // Seçili etiketlerin isimlerini bul
  const selectedTagNames = tags
    .filter(tag => selectedTagIds.includes(tag.id))
    .map(tag => tag.name);

  // Tüm filtreleri temizle
  const clearFilters = () => {
    onChange([]);
    setIsOpen(false); // Kullanıcı deneyimini iyileştirmek için temizlerken menüyü kapatalım
  };

  // Gösterilecek metin
  const displayText = selectedTagIds.length 
    ? `${selectedTagIds.length} ${featuresSelectedText}` 
    : selectFeaturesText;

  // Seçimleri uygula
  const handleApply = () => {
    setIsOpen(false);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            aria-expanded={isOpen}
            className={cn(
              "w-full justify-between text-sm px-3 py-2 h-auto min-h-10",
              "bg-background border-border shadow-sm",
              "hover:border-accent/50 hover:bg-muted/30 transition-colors",
              "font-nunito",
              selectedTagIds.length > 0 && "border-accent/40"
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <Tag className="h-4 w-4 text-accent shrink-0" />
              <span className="font-medium truncate">
                {displayText}
              </span>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground shrink-0 opacity-70 transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-[var(--radix-dropdown-menu-trigger-width)] p-0 border-border bg-card shadow-md min-w-[240px]" 
          align="start"
          alignOffset={-4}
          sideOffset={8}
        >
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 text-accent animate-spin" />
            </div>
          ) : (
            <div className="py-2">
              {/* Etiketlerin listesi */}
              <ScrollArea className="h-60 px-1">
                <div className="space-y-1 px-2">
                  {tags.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      {noFeaturesText}
                    </p>
                  ) : (
                    tags.map((tag) => (
                      <div 
                        key={tag.id}
                        className="flex w-full items-center space-x-2 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => toggleTag(tag.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleTag(tag.id);
                          }
                        }}
                      >
                        <Checkbox
                          id={`tag-${tag.id}`}
                          checked={selectedTagIds.includes(tag.id)}
                          onCheckedChange={() => toggleTag(tag.id)}
                          className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                        />
                        <label
                          htmlFor={`tag-${tag.id}`}
                          className="text-sm cursor-pointer flex-grow"
                        >
                          {tag.name}
                        </label>
                        <span className="text-xs text-muted-foreground">
                          ({tag.count || 0})
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              
              {/* Seçili etiketlerin listesi */}
              {selectedTagIds.length > 0 && (
                <>
                  <DropdownMenuSeparator className="my-2" />
                  <div className="px-3 py-2">
                    <p className="text-xs font-medium text-muted-foreground mb-2 font-montserrat">
                      {selectedFeaturesText}:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTagNames.map(name => (
                        <Badge 
                          key={name} 
                          variant="outline" 
                          className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 font-nunito"
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {/* İşlem butonları */}
              <DropdownMenuSeparator className="my-2" />
              <div className="flex justify-between px-3 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  disabled={selectedTagIds.length === 0}
                  className="text-xs font-normal text-muted-foreground hover:text-foreground hover:bg-muted h-8"
                >
                  {clearText}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleApply}
                  className="text-xs bg-accent text-accent-foreground hover:bg-accent/90 h-8"
                >
                  {applyText}
                </Button>
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Seçili etiketlerin badge'leri (isteğe bağlı - eğer burayı kapatmak isterseniz) */}
      {/* 
      {selectedTagIds.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTagNames.map(name => (
            <Badge 
              key={name} 
              variant="outline" 
              className="bg-accent/5 text-accent border-accent/10 text-xs py-0 h-5"
            >
              {name}
            </Badge>
          ))}
        </div>
      )}
      */}
    </div>
  );
} 