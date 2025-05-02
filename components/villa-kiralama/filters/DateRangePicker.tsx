'use client';

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, isAfter, isBefore, isEqual, startOfMonth, addMonths } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useDateRange } from "@/hooks/use-date-range";

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange: (startDate?: Date, endDate?: Date) => void;
  villaId?: string;
  className?: string;
  minStay?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  villaId,
  minStay = 1,
  size = "md",
  className,
  disabled = false
}: DateRangePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonWidth, setButtonWidth] = useState(0);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));
  const [dateSelectionState, setDateSelectionState] = useState<"start" | "end">("start");
  
  // Button genişliğini izle
  useEffect(() => {
    if (buttonRef.current) {
      const updateWidth = () => {
        if (buttonRef.current) {
          setButtonWidth(buttonRef.current.offsetWidth);
        }
      };
      
      // İlk render'da ve resize olduğunda genişliği güncelle
      updateWidth();
      window.addEventListener('resize', updateWidth);
      
      return () => {
        window.removeEventListener('resize', updateWidth);
      };
    }
  }, []);
  
  // Villa için müsait tarihleri getir
  const { calendarEvents, isLoading, isDateAvailable } = useDateRange(villaId);
  
  // Tarih aralığı bilgisini ve metin bilgisini hesapla
  const totalNights = startDate && endDate
    ? Math.max(Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)), 1)
    : 0;
  
  // Takvim günlerini oluştur - sadece tek ay için
  useEffect(() => {
    const days: Date[] = [];
    
    // Sadece mevcut ay için günleri oluştur
    const month = currentMonth;
    
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(month.getFullYear(), month.getMonth(), i));
    }
    
    setCalendarDays(days);
  }, [currentMonth]);
  
  // Seçim durumunu sıfırla
  useEffect(() => {
    if (!startDate && !endDate) {
      setDateSelectionState("start");
    } else if (startDate && !endDate) {
      setDateSelectionState("end");
    }
  }, [startDate, endDate]);
  
  // Önceki aya geç
  const goToPreviousMonth = () => {
    if (isBefore(addMonths(currentMonth, -1), startOfMonth(today))) return;
    setCurrentMonth(addMonths(currentMonth, -1));
  };
  
  // Sonraki aya geç
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Tarihin seçilebilir olup olmadığını kontrol et
  const isDateSelectable = (date: Date) => {
    // Bugünden önceki tarihler seçilemez
    if (isBefore(date, today) && !isEqual(date, today)) {
      return false;
    }
    
    // Villa ID yoksa veya yükleme durumundaysa sadece geçmiş tarihleri kontrol et
    if (!villaId || isLoading || !calendarEvents?.length) {
      return true;
    }
    
    // Müsait olmayan tarihleri devre dışı bırak
    return isDateAvailable(date);
  };
  
  // Tarihin seçili olup olmadığını kontrol et
  const isDateSelected = (date: Date) => {
    if (!startDate) return false;
    
    if (endDate) {
      return (
        isEqual(date, startDate) || 
        isEqual(date, endDate) || 
        (isAfter(date, startDate) && isBefore(date, endDate))
      );
    }
    
    return isEqual(date, startDate);
  };
  
  // Tarih seçildiğinde
  const handleDateClick = (date: Date) => {
    if (!isDateSelectable(date)) return;
    
    // Seçilen tarihi 14:00 UTC olacak şekilde ayarla (veritabanındaki format ile uyumlu)
    const adjustedDate = new Date(date);
    adjustedDate.setUTCHours(14, 0, 0, 0);
    
    if (dateSelectionState === "start" || (startDate && endDate)) {
      // İlk tarih seçimi veya her iki tarih de seçiliyse, giriş tarihini ayarla
      onChange(adjustedDate, undefined);
      setDateSelectionState("end");
    } else {
      // Çıkış tarihi giriş tarihinden önce olamaz
      if (startDate && isBefore(adjustedDate, startDate)) {
        onChange(adjustedDate, undefined);
        setDateSelectionState("end");
      } else if (startDate) {
        // Minimum konaklama kontrolü
        const dayDiff = Math.floor((adjustedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff < minStay) {
          // Minimum konaklamadan daha az süre seçilmişse, minimum konaklamaya göre ayarla
          const minStayEndDate = new Date(startDate);
          minStayEndDate.setDate(minStayEndDate.getDate() + minStay);
          minStayEndDate.setUTCHours(14, 0, 0, 0);
          onChange(startDate, minStayEndDate);
        } else {
          onChange(startDate, adjustedDate);
        }
        setDateSelectionState("start");
        setIsCalendarOpen(false);
      }
    }
  };
    
  // Tarih formatter yardımcısı
  const formatDateDay = (date: Date) => {
    return format(date, 'd', { locale: tr });
  };
  
  // Ay adını formatla
  const formatMonth = (date: Date) => {
    return format(date, 'MMMM yyyy', { locale: tr });
  };
  
  // Takvimi oluştur
  const renderCalendar = () => {
    // Hafta günlerini hesapla
    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    
    // Ayın ilk gününün haftanın hangi günü olduğunu hesapla (0: Pazar, 1: Pazartesi, ...)
    let firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Pazartesi'yi 0 yap
    
    return (
      <div className="w-full">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map(day => (
            <div key={day} className="text-xs text-center text-muted-foreground px-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {/* Boş günler için dolgu */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-day-${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${index}`} className="p-1 sm:p-2" />
          ))}
          
          {/* Ayın günleri */}
          {calendarDays.map(day => {
            const isSelectable = isDateSelectable(day);
            const isSelected = isDateSelected(day);
            const isStartDate = startDate && isEqual(day, startDate);
            const isEndDate = endDate && isEqual(day, endDate);
            
            return (
              <button 
                type="button"
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                disabled={!isSelectable}
                className={cn(
                  "p-1 sm:p-2 text-xs sm:text-sm rounded-md text-center",
                  isSelectable ? "hover:bg-muted" : "opacity-50 cursor-not-allowed",
                  isSelected && "bg-primary/20 text-primary",
                  isStartDate && "bg-primary text-primary-foreground rounded-l-md",
                  isEndDate && "bg-primary text-primary-foreground rounded-r-md"
                )}
              >
                {formatDateDay(day)}
              </button>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Yükleniyor göstergesi
  const loadingIndicator = (
    <div className="p-4 text-center">
      <p className="text-sm text-muted-foreground">Takvim bilgileri yükleniyor...</p>
    </div>
  );
  
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={buttonRef}
            variant="outline"
            size={size === "lg" ? "lg" : size === "sm" ? "sm" : "default"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !startDate && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate && endDate ? (
              <>
                {format(startDate, 'dd MMM', { locale: tr })} - {format(endDate, 'dd MMM', { locale: tr })}
                <span className="ml-auto text-sm text-muted-foreground">
                  {totalNights} {totalNights === 1 ? 'gece' : 'gece'}
                </span>
              </>
            ) : (
              <span>Tarih Seçin</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-4" 
          align="start" 
          sideOffset={4}
          style={{ width: buttonWidth > 0 ? `${buttonWidth}px` : 'auto' }}
        >
          <div className="space-y-4">     
            <div className="flex justify-between items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={goToPreviousMonth}
                disabled={isBefore(addMonths(currentMonth, -1), startOfMonth(today))}
                className="h-7 w-7"
                aria-label="Önceki ay"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <title>Önceki ay</title>
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>
              <div className="font-medium text-center">
                {formatMonth(currentMonth)}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={goToNextMonth}
                className="h-7 w-7"
                aria-label="Sonraki ay"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <title>Sonraki ay</title>
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Button>
            </div>
            
            {isLoading ? loadingIndicator : renderCalendar()}
            
            {startDate && !endDate && (
              <p className="text-xs text-muted-foreground text-center">
                Lütfen çıkış tarihini seçin
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 