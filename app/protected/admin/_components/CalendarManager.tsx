'use client';

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, Info, RotateCw } from "lucide-react";
import { addMonths, format, isSameDay, isBefore, isAfter, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import type { CalendarEvent } from '@/types/calendar';
import DateRangePicker from './DateRangePicker';

interface CalendarManagerProps {
  villaId: string;
}

// İç kullanım için takvim günü tipi
interface CalendarDay {
  date: Date;
  status: 'AVAILABLE' | 'PENDING' | 'RESERVED' | 'BLOCKED';
  price?: number | null;
  eventType?: 'CHECKIN' | 'CHECKOUT' | 'SPECIAL_OFFER' | null;
}

export default function CalendarManager({ villaId }: CalendarManagerProps) {
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [updatingCalendar, setUpdatingCalendar] = useState(false);
  
  // DateRangePicker için state değişkenleri
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // useMemo ile tarih değişkenlerini hesapla - böylece her render'da yeniden oluşturulmaz
  const today = useMemo(() => new Date(), []);
  const sixMonthsLater = useMemo(() => addMonths(today, 6), [today]);

  // Takvim olaylarını getirme
  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Seçili ay için başlangıç ve bitiş tarihleri
        const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        
        const startDate = format(firstDayOfMonth, 'yyyy-MM-dd');
        const endDate = format(lastDayOfMonth, 'yyyy-MM-dd');
        
        const response = await fetch(
          `/api/villas/${villaId}/calendar-events?startDate=${startDate}&endDate=${endDate}`
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Takvim olayları alınamadı');
        }
        
        const data: CalendarEvent[] = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Takvim olayları yüklenirken hata:', error);
        setError(error instanceof Error ? error.message : 'Takvim olayları yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCalendarEvents();
  }, [villaId, currentMonth]);

  // CalendarEvent[] formatından iç CalendarDay[] formatına dönüştür
  const calendarData: CalendarDay[] = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    return events.map(event => ({
      date: parseISO(event.date),
      status: event.status,
      price: event.price,
      eventType: event.eventType
    }));
  }, [events]);
  
  // Takvimi önceki aya çevir
  const prevMonth = () => {
    setCurrentMonth(prev => {
      const prevMonth = new Date(prev);
      prevMonth.setMonth(prev.getMonth() - 1);
      return prevMonth;
    });
  };
  
  // Takvimi sonraki aya çevir
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const nextMonth = new Date(prev);
      nextMonth.setMonth(prev.getMonth() + 1);
      return nextMonth;
    });
  };

  // DateRangePicker bileşeni için tarih seçim fonksiyonu
  const handleDateSelect = (date: Date | undefined) => {
    if (!startDate || (startDate && endDate)) {
      // İlk tarih seçimi veya her iki tarih de seçiliyse, giriş tarihini ayarla
      setStartDate(date);
      setEndDate(undefined);
    } else {
      // İkinci tarihi ayarla
      setEndDate(date);
    }
  };

  // Takvimi güncelleme işlemi
  const updateCalendar = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Hata",
        description: "Lütfen başlangıç ve bitiş tarihlerini seçin.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdatingCalendar(true);
      
      const response = await fetch('/api/villas/update-calendar-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          villaId,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Takvim güncellenemedi');
      }

      // Başarılı güncelleme
      toast({
        title: "Başarılı",
        description: "Takvim başarıyla güncellendi.",
      });

      // Tarihleri sıfırla
      setStartDate(undefined);
      setEndDate(undefined);
      
      // Mevcut ayı yeniden yükle
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const startDateParam = format(firstDayOfMonth, 'yyyy-MM-dd');
      const endDateParam = format(lastDayOfMonth, 'yyyy-MM-dd');
      
      const newResponse = await fetch(
        `/api/villas/${villaId}/calendar-events?startDate=${startDateParam}&endDate=${endDateParam}`
      );
      
      if (!newResponse.ok) {
        throw new Error('Güncellenmiş takvim olayları alınamadı');
      }
      
      const newData: CalendarEvent[] = await newResponse.json();
      setEvents(newData);
      
    } catch (error) {
      console.error('Takvim güncellenirken hata:', error);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : 'Takvim güncellenemedi',
        variant: "destructive",
      });
    } finally {
      setUpdatingCalendar(false);
    }
  };
  
  // Özel takvim oluştur
  const renderCalendar = () => {
    // Takvimde gösterilecek ayın ilk ve son günleri
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Takvimin ilk günü (ayın ilk gününün haftanın hangi günü olduğuna göre)
    const startDay = new Date(firstDayOfMonth);
    startDay.setDate(startDay.getDate() - startDay.getDay());
    
    // Takvimin son günü (son haftayı tamamlayacak şekilde)
    const endDay = new Date(lastDayOfMonth);
    endDay.setDate(endDay.getDate() + (6 - endDay.getDay()));
    
    // Haftanın günleri
    const weekDays = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];
    
    // Takvim günlerini oluştur
    const calendarDays = [];
    const startCalendarDate = new Date(startDay);
    
    while (startCalendarDate <= endDay) {
      calendarDays.push(new Date(startCalendarDate));
      startCalendarDate.setDate(startCalendarDate.getDate() + 1);
    }
    
    return (
      <div className="calendar">
        {/* Ay başlığı ve gezinme butonları */}
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <button 
            type="button"
            onClick={prevMonth} 
            disabled={isBefore(new Date(currentMonth.getFullYear(), currentMonth.getMonth()), today)}
            className="p-1 sm:p-2 text-gray-500 disabled:opacity-50 hover:bg-gray-100 rounded-full transition-colors w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
            aria-label="Önceki ay"
          >
            «
          </button>
          <h3 className="text-base sm:text-lg font-medium">
            {format(currentMonth, 'MMMM yyyy', { locale: tr })}
          </h3>
          <button 
            type="button"
            onClick={nextMonth} 
            disabled={isAfter(new Date(currentMonth.getFullYear(), currentMonth.getMonth()), sixMonthsLater)}
            className="p-1 sm:p-2 text-gray-500 disabled:opacity-50 hover:bg-gray-100 rounded-full transition-colors w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
            aria-label="Sonraki ay"
          >
            »
          </button>
        </div>
        
        {/* Hafta başlıkları */}
        <div className="grid grid-cols-7 mb-1 sm:mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Günler */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const calendarDay = calendarData.find(item => isSameDay(item.date, date));
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const isReserved = calendarDay?.status === 'RESERVED';
            const isPending = calendarDay?.status === 'PENDING';
            const isBlocked = calendarDay?.status === 'BLOCKED';
            const isDisabled = isBefore(date, today);
            const isSpecialOffer = calendarDay?.eventType === 'SPECIAL_OFFER';
            const isCheckIn = calendarDay?.eventType === 'CHECKIN';
            const isCheckOut = calendarDay?.eventType === 'CHECKOUT';
            
            // DateRangePicker ile seçilmiş tarih kontrolü
            const isSelected = (startDate && isSameDay(date, startDate)) || 
                             (endDate && isSameDay(date, endDate)) ||
                             (startDate && endDate && isAfter(date, startDate) && isBefore(date, endDate));
            
            return (
              <div 
                key={`calendar-day-${date.toISOString()}-${index}`}
                className={`
                  p-1 text-center relative h-10 sm:h-14 flex flex-col justify-center items-center
                  ${!isCurrentMonth ? 'text-gray-300' : ''}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  ${isReserved ? 'bg-red-50 text-red-800' : ''}
                  ${isPending ? 'bg-yellow-50 text-yellow-800' : ''}
                  ${isBlocked ? 'bg-gray-100 text-gray-800' : ''}
                  ${isSpecialOffer ? 'bg-green-50' : ''}
                  ${isSelected ? 'border-2 border-primary' : ''}
                  rounded-md
                `}
              >
                {isCheckIn && (
                  <div className="absolute inset-0 overflow-hidden">
                    {/* CHECKIN hücresi için çapraz dolgu efekti - sağ alt köşeden başlayıp çapraz yarısını kaplayacak şekilde */}
                    <div className="absolute right-0 bottom-0 w-full h-full">
                      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <title>Giriş Günü</title>
                        {/* Sağ alt köşeden başlayan üçgen dolgu - ortada 2px boşluk bırakacak şekilde küçültülmüş üçgen */}
                        <polygon points="100,100 2,100 100,2" fill="rgba(254, 242, 242)" />
                      </svg>
                    </div>
                  </div>
                )}
                
                {isCheckOut && (
                  <div className="absolute inset-0 overflow-hidden">
                    {/* CHECKOUT hücresi için çapraz dolgu efekti - sol üst köşeden başlayıp çapraz yarısını kaplayacak şekilde */}
                    <div className="absolute left-0 top-0 w-full h-full">
                      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <title>Çıkış Günü</title>
                        {/* Sol üst köşeden başlayan üçgen dolgu - ortada 2px boşluk bırakacak şekilde küçültülmüş üçgen */}
                        <polygon points="0,0 98,0 0,98" fill="rgba(254, 242, 242)" />
                      </svg>
                    </div>
                  </div>
                )}
                
                <span className="text-xs sm:text-sm relative z-10">{date.getDate()}</span>
                
                {/* Fiyat gösterimi */}
                {calendarDay?.price && (
                  <span className={`text-[9px] sm:text-[10px] font-semibold ${isReserved ? 'text-red-700' : 'text-green-700'} relative z-10`}>
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(calendarDay.price)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // DateRangePicker bileşeni
  const renderDateRangePicker = () => {
    return (
      <div className="mt-6 border rounded-md p-4">
        <h3 className="text-base font-medium mb-3">Takvim Güncelleme</h3>
        <div className="space-y-4">
          <DateRangePicker 
            today={today}
            selectedStartDate={startDate}
            selectedEndDate={endDate}
            onDateSelect={handleDateSelect}
            minStay={1}
            villaId={villaId}
          />
          
          <div className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setStartDate(undefined);
                setEndDate(undefined);
              }}
              disabled={updatingCalendar || (!startDate && !endDate)}
            >
              Temizle
            </Button>
            <Button
              onClick={updateCalendar}
              disabled={updatingCalendar || !startDate || !endDate}
            >
              {updatingCalendar ? (
                <>
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                "Takvimi Güncelle"
              )}
            </Button>
          </div>
          
          {startDate && !endDate && (
            <Alert>
              <AlertDescription>
                Lütfen bitiş tarihini de seçin.
              </AlertDescription>
            </Alert>
          )}
          
          {startDate && endDate && (
            <Alert>
              <AlertDescription>
                {format(startDate, 'dd MMMM yyyy', { locale: tr })} - {format(endDate, 'dd MMMM yyyy', { locale: tr })} 
                tarihleri arasındaki günler rezervasyon için bloklanacak. Başlangıç tarihi müsait (AVAILABLE) olarak CHECKIN, 
                bitiş tarihi müsait (AVAILABLE) olarak CHECKOUT işaretlenecek ve aradaki günler rezerveli (RESERVED) olarak ayarlanacaktır.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  };

  // Takvim bilgilendirme mesajı
  const renderCalendarInfo = () => {
    return (
      <Alert className="mt-4">
        <Info className="h-4 w-4" />
        <AlertTitle>Müsaitlik Takvimi</AlertTitle>
        <AlertDescription className="text-sm">
          <p>Villa takvimini buradan yönetebilirsiniz.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="flex items-center">
              <div className="w-3 h-3 border border-gray-200 rounded-sm mr-1" />
              <span className="text-xs">Müsait</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-50 border border-red-100 rounded-sm mr-1" />
              <span className="text-xs">Rezerveli</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-50 border border-yellow-100 rounded-sm mr-1" />
              <span className="text-xs">Ön Rezervasyon</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded-sm mr-1" />
              <span className="text-xs">Engelli</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-50 rounded-sm mr-1" />
              <span className="text-xs">Özel Teklif</span>
            </div>
            <div className="flex items-center">
              <div className="relative w-3 h-3 border rounded-sm mr-1 bg-white overflow-hidden">
                <div className="absolute right-0 bottom-0 w-full h-full">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <title>Giriş İşareti</title>
                    <polygon points="100,100 2,100 100,2" fill="rgba(254, 242, 242)" />
                  </svg>
                </div>
              </div>
              <span className="text-xs">Giriş</span>
            </div>
            <div className="flex items-center">
              <div className="relative w-3 h-3 border rounded-sm mr-1 bg-white overflow-hidden">
                <div className="absolute left-0 top-0 w-full h-full">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <title>Çıkış İşareti</title>
                    <polygon points="0,0 98,0 0,98" fill="rgba(254, 242, 242)" />
                  </svg>
                </div>
              </div>
              <span className="text-xs">Çıkış</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  // Olay istatistikleri
  const renderEventStats = () => {
    return (
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-md border">
          <div className="text-sm font-medium text-gray-500">Rezerveli</div>
          <div className="text-lg font-semibold mt-1">{events.filter(e => e.status === 'RESERVED').length} gün</div>
        </div>
        <div className="bg-white p-3 rounded-md border">
          <div className="text-sm font-medium text-gray-500">Ön Rezervasyon</div>
          <div className="text-lg font-semibold mt-1">{events.filter(e => e.status === 'PENDING').length} gün</div>
        </div>
        <div className="bg-white p-3 rounded-md border">
          <div className="text-sm font-medium text-gray-500">Müsait</div>
          <div className="text-lg font-semibold mt-1">{events.filter(e => e.status === 'AVAILABLE').length} gün</div>
        </div>
        <div className="bg-white p-3 rounded-md border">
          <div className="text-sm font-medium text-gray-500">Engelli</div>
          <div className="text-lg font-semibold mt-1">{events.filter(e => e.status === 'BLOCKED').length} gün</div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b">
        <CardTitle>Villa Takvim Yönetimi</CardTitle>
        <CardDescription>
          Villanın rezervasyon ve müsaitlik durumunu görüntüleyin ve güncelleyin
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6">
        {loading ? (
          <div className="flex justify-center items-center h-80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Takvim olayları yükleniyor...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-80 text-red-500">
            <p>Hata: {error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {renderCalendar()}
            {renderCalendarInfo()}
            {renderDateRangePicker()}
            {renderEventStats()}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="justify-between border-t p-4 sm:p-6">
        <p className="text-sm text-muted-foreground">
          Villa ID: {villaId}
        </p>
      </CardFooter>
    </Card>
  );
} 