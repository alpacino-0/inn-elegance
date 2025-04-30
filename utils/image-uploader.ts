import { supabase } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Dosya yüklemek için yardımcı fonksiyon
 * @param file Yüklenecek dosya
 * @param villaId Villanın UUID'si
 * @returns Yüklenen dosyanın URL'si veya hata durumunda null
 */
export async function uploadVillaImage(file: File, villaId: string): Promise<string | null> {
  try {
    // Dosya boyutu kontrolü (örn. max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      throw new Error('Dosya boyutu çok büyük! Maksimum 10MB olmalıdır.');
    }
    
    // Dosya tipini kontrol et
    if (!file.type.startsWith('image/')) {
      throw new Error('Sadece resim dosyaları yüklenebilir.');
    }
    
    // Benzersiz dosya adı oluştur
    const fileExt = file.name.split('.').pop();
    const fileName = `${villaId}/${uuidv4()}.${fileExt}`;
    
    // Dosyayı Supabase Storage'a yükle
    const { data, error } = await supabase
      .storage
      .from('villa-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Resim yükleme hatası:', error.message);
      return null;
    }
    
    // Yüklenen dosyanın genel URL'sini al
    const { data: urlData } = supabase
      .storage
      .from('villa-images')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Görsel yükleme işlemi başarısız:', error);
    return null;
  }
} 