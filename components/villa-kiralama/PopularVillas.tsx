import type { Villa } from '@/types/villa';
import type { VillaImage } from '@/types/villa-image';
import { createClient } from '@/utils/supabase/server';
import { VillaCard } from './VillaCard';

export default async function PopularVillas() {
  // Supabase ile popüler villaları çek
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('Villa')
    .select(`
      id, 
      title, 
      description, 
      slug, 
      mainRegion, 
      subRegion, 
      deposit, 
      bedrooms, 
      bathrooms, 
      maxGuests, 
      tags,
      status,
      isPromoted,
      createdAt,
      updatedAt
    `)
    .eq('isPromoted', true)
    .eq('status', 'ACTIVE')
    .order('createdAt', { ascending: false })
    .limit(6);

  if (error) {
    // Hata durumunda kullanıcıya bilgi ver
    console.error('Villa sorgu hatası:', error);
    return (
      <div className="text-red-500 p-4">
        Popüler villalar yüklenirken bir hata oluştu: {error.message}
      </div>
    );
  }

  // Eğer hiç veri yoksa
  if (!data || data.length === 0) {
    return (
      <div className="text-muted-foreground p-4">
        Şu anda popüler villa bulunmamaktadır.
      </div>
    );
  }

  // Her villa için görselleri çek
  const villaImagesPromises = data.map(async (villa) => {
    // Villa görselleri tablosundan görselleri çek (varsa)
    const { data: villaImages } = await supabase
      .from('VillaImage')
      .select('id, imageUrl, title, altText, order, isCoverImage, createdAt')
      .eq('villaId', villa.id)
      .order('order', { ascending: true })
      .limit(5); // İlk 5 görsel
    
    // VillaImage tipini dönüştür - villaId ekle
    const images: VillaImage[] = (villaImages || []).map(img => ({
      ...img,
      villaId: villa.id // villaId ekle - zaten sorgu bu villaId ile yapıldı
    }));
    
    // İlk olarak kapak görselleri (isCoverImage=true) sonra diğer görselleri
    const sortedImages = [...images].sort((a, b) => {
      // Önce kapak görseli (isCoverImage=true)
      if (a.isCoverImage && !b.isCoverImage) return -1;
      if (!a.isCoverImage && b.isCoverImage) return 1;
      
      // Sonra order'a göre sırala
      return a.order - b.order;
    });
    
    return {
      villaId: villa.id,
      images: sortedImages.map(img => img.imageUrl)
    };
  });
  
  // Tüm görsel çekme işlemlerini bekle
  const villaImagesResults = await Promise.all(villaImagesPromises);
  
  // Her villa için görsel dizisini birleştir
  const villasWithImages = data.map(villa => {
    const villaImagesResult = villaImagesResults.find(result => result.villaId === villa.id);
    
    return {
      ...villa,
      villaImages: villaImagesResult?.images || []
    };
  });

  // Veri Villa tipine ve villaImages ekstra alanına uygun olarak cast edilir
  // Not: Supbase sorgusu Villa tablısından geldiği için data aslında Villa tipindedir,
  // ancak TypeScript bu bağlantıyı kuramadığından tip güvenliği için cast edilmelidir.
  const villas = villasWithImages as unknown as (Villa & { villaImages?: string[] })[];

  return (
    <section className="w-full max-w-6xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-2">Popüler Villalar</h2>
      <p className="text-muted-foreground mb-6">
        En çok tercih edilen villalarımızı hemen inceleyin.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {villas.map((villa) => (
          <VillaCard 
            key={villa.id} 
            villa={villa} 
            villaImages={villa.villaImages}
          />
        ))}
      </div>
    </section>
  );
}