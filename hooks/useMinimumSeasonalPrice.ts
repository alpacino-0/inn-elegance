import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';

/**
 * Belirli bir villa için en düşük gecelik fiyatı getiren hook
 * 
 * Bu hook, aktif sezon fiyatları içerisinde en düşük nightlyPrice değerini döndürür.
 * Şu andaki (canlı) veya gelecekteki sezon fiyatlarını dikkate alır.
 */
export function useMinimumSeasonalPrice(villaId: string) {
  return useQuery({
    queryKey: ['minimum-seasonal-price', villaId],
    queryFn: async () => {
      try {
        const supabase = createClient();
        
        // Güncel tarihi alıyoruz
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Günün başlangıcına ayarla
        
        // Aktif sezon fiyatlarından en düşük olanı sorgula
        const { data, error } = await supabase
          .from('SeasonalPrice')
          .select('nightlyPrice, currencyId')
          .eq('villaId', villaId)
          .eq('isActive', true) 
          .gte('endDate', today.toISOString()) // Bugün veya gelecekte biten sezonlar
          .order('nightlyPrice', { ascending: true }) // En düşük fiyata göre sırala
          .limit(1); // Sadece en düşük fiyatı al
        
        if (error) {
          console.error('Minimum fiyat sorgu hatası:', error);
          throw new Error(error.message);
        }
        
        if (!data || data.length === 0) {
          return null; // Fiyat bulunamadı
        }

        // En düşük fiyatı döndür (nightlyPrice)
        return data[0].nightlyPrice;
      } catch (error) {
        console.error('Minimum fiyat getirme hatası:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 dakika cache
    placeholderData: null,
    retry: 2,
  });
} 