import { createClient } from '@/utils/supabase/client';
import type { Villa } from '@/types/villa';
import type { VillaImage } from '@/types/villa-image';

// Villa servisinin genişletilmiş türü
interface ExtendedVilla extends Villa {
  featuredImage?: string;
  images?: VillaImage[];
  locationName?: string;
  locationDistrict?: string;
  locationCity?: string;
}

/**
 * Villa servisi
 * Villa bilgilerini getirme işlemlerini yönetir
 */
export const VillaService = {
  /**
   * Villa ID'sine göre villa bilgilerini getirir
   */
  async getVillaById(villaId: string): Promise<ExtendedVilla | null> {
    try {
      // Supabase istemcisini oluştur
      const supabase = createClient();
      
      // Villayı ID'ye göre sorgula, ilişkisel sorgu kullanmayı iptal ediyoruz
      const { data, error } = await supabase
        .from('Villa')
        .select('*')
        .eq('id', villaId)
        .single();

      if (error) {
        throw new Error(`Villa bilgileri alınırken hata: ${error.message}`);
      }

      // SubRegion bilgilerini ayrı bir sorgu ile al
      let locationInfo = {
        district: data.subRegion || "",
        city: data.mainRegion || ""
      };

      try {
        const { data: subRegionData, error: subRegionError } = await supabase
          .from('SubRegion')
          .select('name, district, city')
          .eq('id', data.subRegionId)
          .single();

        if (!subRegionError && subRegionData) {
          locationInfo = {
            district: subRegionData.district || subRegionData.name || data.subRegion,
            city: subRegionData.city || data.mainRegion
          };
        }
      } catch (locationErr) {
        console.error('Lokasyon bilgileri alınamadı:', locationErr);
        // Lokasyon bilgileri alınamazsa mevcut verileri kullan
      }

      // Villa resimlerini getir
      const { data: images, error: imagesError } = await supabase
        .from('VillaImage')
        .select('*')
        .eq('villaId', villaId)
        .order('order', { ascending: true });

      if (imagesError) {
        console.error('Villa resimleri alınırken hata:', imagesError);
      }

      // Villa türüne çevir ve görsellerini ekle
      const villa: ExtendedVilla = {
        ...data,
        images: images || [],
        locationDistrict: locationInfo.district,
        locationCity: locationInfo.city
      };

      // Eğer kapak resmi varsa featuredImage olarak ayarla
      if (villa.images && villa.images.length > 0) {
        const coverImage = villa.images.find(img => img.isCoverImage);
        villa.featuredImage = coverImage ? coverImage.imageUrl : villa.images[0].imageUrl;
      }

      return villa;
    } catch (err) {
      console.error('Villa bilgileri alınırken hata:', err);
      return null;
    }
  },

  /**
   * Slug'a göre villa bilgilerini getirir
   */
  async getVillaBySlug(slug: string): Promise<ExtendedVilla | null> {
    try {
      // Supabase istemcisini oluştur
      const supabase = createClient();
      
      // Villayı slug'a göre sorgula, ilişkisel sorgu yerine temel sorgu
      const { data, error } = await supabase
        .from('Villa')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        throw new Error(`Villa bilgileri alınırken hata: ${error.message}`);
      }

      // SubRegion bilgilerini ayrı bir sorgu ile al
      let locationInfo = {
        district: data.subRegion || "",
        city: data.mainRegion || ""
      };

      try {
        const { data: subRegionData, error: subRegionError } = await supabase
          .from('SubRegion')
          .select('name, district, city')
          .eq('id', data.subRegionId)
          .single();

        if (!subRegionError && subRegionData) {
          locationInfo = {
            district: subRegionData.district || subRegionData.name || data.subRegion,
            city: subRegionData.city || data.mainRegion
          };
        }
      } catch (locationErr) {
        console.error('Lokasyon bilgileri alınamadı:', locationErr);
        // Lokasyon bilgileri alınamazsa mevcut verileri kullan
      }

      // Villa resimlerini getir
      const { data: images, error: imagesError } = await supabase
        .from('VillaImage')
        .select('*')
        .eq('villaId', data.id)
        .order('order', { ascending: true });

      if (imagesError) {
        console.error('Villa resimleri alınırken hata:', imagesError);
      }

      // Villa ve görsellerini birleştir
      const villa: ExtendedVilla = {
        ...data,
        images: images || [],
        locationDistrict: locationInfo.district,
        locationCity: locationInfo.city
      };

      // Eğer kapak resmi varsa featuredImage olarak ayarla
      if (villa.images && villa.images.length > 0) {
        const coverImage = villa.images.find(img => img.isCoverImage);
        villa.featuredImage = coverImage ? coverImage.imageUrl : villa.images[0].imageUrl;
      }

      return villa;
    } catch (err) {
      console.error('Villa bilgileri alınırken hata:', err);
      return null;
    }
  }
}; 