import { Plane, Ship, UmbrellaIcon, Timer, MapPin, Car, Users, Compass, LifeBuoy, Coffee, FileText, HelpCircle } from "lucide-react";
import { CardHoverReveal, CardHoverRevealMain, CardHoverRevealContent } from "@/components/reveal-on-hover";
import Image from "next/image";

type TourType = "Hava Limanı Transfer" | "Tekne Turu" | "Scuba Diving" | "Günlük Tur" | "Şehir Turu" | "Safari" | string;
type TourFeature = "Öğle Yemeği Dahil" | "Rehber Dahil" | "Sigorta Dahil" | "Ulaşım Dahil" | "Ekipman Dahil" | string;

interface TourService {
  id: number;
  title: string;
  description: string;
  image: string;
  type: TourType;
  features: TourFeature[];
  duration?: string;
  groupSize?: string;
  location?: string;
  startingTime?: string;
}

const tourData: TourService[] = [
  {
    id: 1,
    title: "Havalimanı VIP Transfer",
    description: "Lüks araçlarımızla havalimanından villanıza konforlu ve özel transfer hizmeti. Bagaj taşıma ve profesyonel karşılama dahildir.",
    image: "https://mfaexsxibqfwtpchkppy.supabase.co/storage/v1/object/public/villa-images/Hizmetler/tv-9.jpg",
    type: "Hava Limanı Transfer",
    features: ["Özel Şoför", "Wi-Fi", "İkram"],
    duration: "30-60 dk",
    groupSize: "1-6 Kişi",
    location: "Tüm Havalimanları",
  },
  {
    id: 2,
    title: "Özel Tekne Turu",
    description: "Eşsiz koyları keşfedin, masmavi sularda yüzün ve teknede muhteşem deniz manzarası eşliğinde gününüzün tadını çıkarın.",
    image: "https://mfaexsxibqfwtpchkppy.supabase.co/storage/v1/object/public/villa-images/Hizmetler/woman-standing-nose-yacht-sunny-summer-day-breeze-developing-hair.jpg",
    type: "Tekne Turu",
    features: ["Öğle Yemeği Dahil", "Yüzme Molaları", "Rehber Dahil"],
    duration: "Tam Gün",
    groupSize: "Özel Grup",
    location: "Sahil Bölgeleri",
    startingTime: "10:00"
  },
  {
    id: 3,
    title: "Dalış Deneyimi",
    description: "Uzman eğitmenler eşliğinde Akdeniz'in büyüleyici sualtı dünyasını keşfedin. Tüm ekipman ve eğitim programı dahildir.",
    image: "https://mfaexsxibqfwtpchkppy.supabase.co/storage/v1/object/public/villa-images/Hizmetler/woman-with-flippers-swimming-ocean.jpg",
    type: "Scuba Diving",
    features: ["Ekipman Dahil", "Eğitim", "Sigorta Dahil"],
    duration: "Yarım Gün",
    groupSize: "Küçük Gruplar",
    location: "Dalış Noktaları",
    startingTime: "09:00"
  }
];

export default function Page() {
  return (
    <div className="container mx-auto py-8 md:py-12 px-4 sm:px-6">
      <header className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-[#100049] text-center">Tatil Hizmetlerimiz</h1>
        <div className="w-24 h-1 bg-[#180675] mx-auto mb-6" />
        <p className="text-center mb-6 max-w-3xl mx-auto text-[#000000]/80 text-sm md:text-base">
          Tatil deneyiminizi unutulmaz kılmak için özenle tasarlanmış, özel tur ve transfer hizmetlerimizle tanışın.
          Bodrum&apos;dan Antalya&apos;ya, Marmaris&apos;ten Fethiye&apos;ye kadar tüm tatil bölgelerinde hizmetinizdeyiz.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {tourData.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <button 
          type="button"
          className="mt-4 py-2 px-6 bg-[#100049] text-white rounded text-sm font-medium hover:bg-[#180675] transition-colors"
        >
          İletişime Geçin
        </button>
      </div>
    </div>
  );
}

function TourCard({ tour }: { tour: TourService }) {
  return (
    <CardHoverReveal 
      className="h-[400px] sm:h-[420px] w-full rounded-lg shadow-sm overflow-hidden border border-gray-100 bg-white"
      aspectRatio="auto"
      animationSpeed="normal"
    >
      <CardHoverRevealMain 
        hoverScale={1.02} 
        overlayColor="#100049" 
        overlayOpacity={0.1}
        transitionSpeed="normal"
      >
        <div className="absolute top-3 left-3 z-10 bg-[#180675]/90 backdrop-blur-sm py-1 px-2.5 rounded-full text-white font-medium text-xs shadow-sm flex items-center">
          <TourTypeIcon type={tour.type} className="mr-1.5" />
          {tour.type}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
          <h2 className="text-lg font-bold text-white">{tour.title}</h2>
          <div className="flex items-center mt-1 text-white/90">
            <MapPin size={12} className="mr-1" />
            <p className="text-xs">{tour.location}</p>
          </div>
        </div>
        
        <Image
          width={1077}
          height={606}
          alt={`${tour.title} hizmet görseli`}
          src={tour.image}
          className="w-full h-full object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      </CardHoverRevealMain>

      <CardHoverRevealContent 
        className="space-y-3 text-[#000000] border-t border-[#100049]/10"
        position="elegant"
        glassMorphism={true}
      >
        <div className="flex justify-between items-start border-b border-[#100049]/5 pb-2">
          <div>
            <h2 className="text-base font-bold text-[#100049]">{tour.title}</h2>
            <div className="flex flex-wrap mt-1 gap-x-3 text-[#000000]/70 text-xs">
              {tour.duration && (
                <div className="flex items-center">
                  <Timer size={12} className="mr-1" /> 
                  <span>{tour.duration}</span>
                </div>
              )}
              {tour.groupSize && (
                <div className="flex items-center">
                  <Users size={12} className="mr-1" /> 
                  <span>{tour.groupSize}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <p className="text-xs text-[#000000]/90 line-clamp-2 leading-relaxed">
            {tour.description}
          </p>
        </div>
        
        <div>
          <div className="flex flex-wrap gap-1.5">
            {tour.features.slice(0, 3).map((feature) => (
              <div key={feature} className="rounded-full bg-[#180675]/10 px-2 py-0.5 flex items-center">
                <FeatureIcon feature={feature} />
                <p className="text-xs font-medium text-[#180675]">{feature}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-2 pt-1">
          <button 
            type="button"
            className="flex-1 py-2 bg-[#100049] text-white rounded-md text-xs font-medium hover:bg-[#180675] transition-colors flex items-center justify-center"
          >
            <FileText size={12} className="mr-1.5" />
            Rezervasyon
          </button>
          <button 
            type="button"
            className="py-2 px-3 border border-[#100049]/20 text-[#100049] rounded-md text-xs font-medium hover:bg-[#100049]/5 transition-colors flex items-center justify-center"
          >
            <HelpCircle size={12} className="mr-1.5" />
            Bilgi
          </button>
        </div>
        <p className="text-[10px] text-center text-[#000049]/70 -mt-1">Fiyatlandırma için iletişime geçiniz</p>
      </CardHoverRevealContent>
    </CardHoverReveal>
  );
}

function TourTypeIcon({ type, className = "" }: { type: TourType, className?: string }) {
  switch(type) {
    case "Hava Limanı Transfer":
      return <Plane size={12} className={className} />;
    case "Tekne Turu":
      return <Ship size={12} className={className} />;
    case "Scuba Diving":
      return <LifeBuoy size={12} className={className} />;
    case "Günlük Tur":
      return <Compass size={12} className={className} />;
    case "Şehir Turu":
      return <Car size={12} className={className} />;
    default:
      return <Compass size={12} className={className} />;
  }
}

function FeatureIcon({ feature }: { feature: TourFeature }) {
  switch(feature) {
    case "Öğle Yemeği Dahil":
      return <UmbrellaIcon size={10} className="mr-1 text-[#180675]" />;
    case "Rehber Dahil":
      return <Compass size={10} className="mr-1 text-[#180675]" />;
    case "Sigorta Dahil":
      return <FileText size={10} className="mr-1 text-[#180675]" />;
    case "Ulaşım Dahil":
      return <Car size={10} className="mr-1 text-[#180675]" />;
    case "Ekipman Dahil":
      return <LifeBuoy size={10} className="mr-1 text-[#180675]" />;
    case "Özel Şoför":
      return <Users size={10} className="mr-1 text-[#180675]" />;
    case "Wi-Fi":
      return <Plane size={10} className="mr-1 text-[#180675]" />;
    case "İkram":
      return <Coffee size={10} className="mr-1 text-[#180675]" />;
    case "Yüzme Molaları":
      return <Ship size={10} className="mr-1 text-[#180675]" />;
    case "Eğitim":
      return <Users size={10} className="mr-1 text-[#180675]" />;
    default:
      return <Compass size={10} className="mr-1 text-[#180675]" />;
  }
}