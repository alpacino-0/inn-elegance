import { notFound } from "next/navigation";
import VillaHeader from "@/components/villa-kiralama/slug/VillaHeader";
import VillaGallery from "@/components/villa-kiralama/slug/VillaGallery";
import ContentContainer from "@/components/villa-kiralama/slug/ContentContainer";
import { createClient } from "@/utils/supabase/server";
import type { ExtendedVillaAmenity } from "@/components/villa-kiralama/slug/info/VillaInfo";

// VillaImage için tip tanımı
interface VillaImage {
  id: string;
  villaId: string;
  imageUrl: string;
  altText?: string;
  title?: string;
  order?: number;
  isCoverImage?: boolean;
  createdAt?: string;
}

// SourceImageType tipini tanımla (VillaGallery için)
interface SourceImageType {
  id: string;
  imageUrl: string;
  altText?: string;
  title?: string;
  order?: number;
  isCoverImage?: boolean;
  [key: string]: string | number | boolean | undefined; // any yerine daha spesifik tip
}

// Villa detay sayfası - Supabase'den veri çeken server component
export default async function VillaDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string; locale?: string }> 
}) {
  // Next.js 15'te params parametresi bir Promise, await kullanarak değerlerini almalıyız
  const { slug } = await params;
  
  if (!slug) {
    notFound();
  }
  
  // Supabase istemcisini oluştur ve await kullan
  const supabase = await createClient();
  
  // Villa verisini getir
  const { data: villa, error } = await supabase
    .from('Villa')
    .select('*')
    .eq('slug', slug)
    .single();
  
  // Hata durumunda veya villa bulunamadıysa 404 sayfasına yönlendir
  if (error || !villa) {
    notFound();
  }
  
  // Görsel verilerini ayrı bir sorgu ile al
  let villaImages: VillaImage[] = [];
  try {
    const { data: images } = await supabase
      .from('VillaImage')
      .select('*')
      .eq('villaId', villa.id);
    
    if (images && images.length > 0) {
      villaImages = images;
    }
  } catch {
    // Hata durumunda boş dizi kullan
  }
  
  // Olanakları (amenities) ayrı bir sorgu ile al
  let villaAmenities: ExtendedVillaAmenity[] = [];
  try {
    const { data: amenities } = await supabase
      .from('VillaAmenity')
      .select('*')
      .eq('villaId', villa.id);
    
    if (amenities && amenities.length > 0) {
      villaAmenities = amenities.map(amenity => ({
        ...amenity,
        icon: amenity.icon || null // undefined -> null dönüşümü
      }));
    }
  } catch {
    // Hata durumunda boş dizi kullan
  }
  
  // Genişletilmiş villa nesnesi oluştur
  const extendedVilla = {
    ...villa,
    amenities: villaAmenities,
    customRules: [], // Örnek değer, gerçek verilerinizle değiştirin
    mapUrl: '' // Örnek değer, gerçek verilerinizle değiştirin
  };
  
  // SourceImageType'a dönüştür
  const galleryImages: SourceImageType[] = villaImages.map(img => ({
    ...img,
  }));
  
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 md:py-6 space-y-3 sm:space-y-4 md:space-y-6">
      <VillaHeader 
        title={villa.title}
      />
      
      {galleryImages.length > 0 && (
        <VillaGallery 
          images={galleryImages} 

        />
      )}
      
      {/* ContentContainer bileşeni */}
      <ContentContainer villa={extendedVilla} />
    </div>
  );
}