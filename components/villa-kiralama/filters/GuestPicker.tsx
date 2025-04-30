'use client';

import { useState, useCallback, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface GuestPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  label?: string;
}

export function GuestPicker({ 
  value, 
  onChange, 
  min = 1, 
  max = 20,
  className,
  label = "Misafir",
  ...props
}: GuestPickerProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>) {
  const [count, setCount] = useState<number>(value);

  // Değer değiştiğinde state'i güncelle
  useEffect(() => {
    setCount(value);
  }, [value]);

  // Değer arttırma işleyicisi
  const increment = useCallback(() => {
    if (count < max) {
      const newValue = count + 1;
      setCount(newValue);
      onChange(newValue);
    }
  }, [count, onChange, max]);

  // Değer azaltma işleyicisi
  const decrement = useCallback(() => {
    if (count > min) {
      const newValue = count - 1;
      setCount(newValue);
      onChange(newValue);
    }
  }, [count, onChange, min]);

  return (
    <div className={cn(
      "w-full flex items-center justify-between rounded-md border border-border p-2 bg-background",
      "shadow-sm hover:border-accent/50 transition-colors duration-200",
      className
    )} {...props}>
      <Label className="text-sm font-medium text-foreground pl-1 flex-1">
        {label}
      </Label>
      
      <div className="flex items-center space-x-1 sm:space-x-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            "h-8 w-8 sm:h-9 sm:w-9 rounded-full border-border",
            "transition-all duration-200",
            count <= min 
              ? "opacity-50 cursor-not-allowed bg-muted" 
              : "hover:border-accent hover:text-accent hover:bg-accent/5"
          )}
          onClick={decrement}
          disabled={count <= min}
          aria-label={`${label} sayısını azalt`}
        >
          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <div className="flex items-baseline select-none w-10 sm:w-12 justify-center">
          <span className="text-base sm:text-lg font-semibold font-montserrat text-foreground">
            {count}
          </span>
          <span className="ml-1 text-xs sm:text-sm text-muted-foreground font-nunito hidden xs:inline-block">
            {label}
          </span>
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            "h-8 w-8 sm:h-9 sm:w-9 rounded-full border-border",
            "transition-all duration-200",
            count >= max 
              ? "opacity-50 cursor-not-allowed bg-muted" 
              : "hover:border-accent hover:text-accent hover:bg-accent/5"
          )}
          onClick={increment}
          disabled={count >= max}
          aria-label={`${label} sayısını arttır`}
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
} 