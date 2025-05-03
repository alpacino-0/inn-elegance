import HeroSection from "@/components/home/hero/HeroSection";
import PopularVillas from "@/components/villa-kiralama/PopularVillas";
import JsonLd from "@/components/shared/JsonLd";
import { metadata } from "./metadata";

// Metadata tanımını metadata.tsx dosyasına taşıdık
export { metadata };

// JSON-LD yapısal verileri
export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Inn Elegance',
    url: 'https://www.innelegance.com',
    logo: 'https://www.innelegance.com/logo-siyah.svg',
    sameAs: [
      'https://www.facebook.com/innelegance',
      'https://www.instagram.com/innelegance',
      'https://twitter.com/innelegance'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+90-531-621-61-00',
      contactType: 'customer service',
      areaServed: 'TR',
      availableLanguage: ['Turkish', 'English']
    }
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <main className="flex flex-col">
        <HeroSection />
        <div className="flex flex-col justify-center items-center py-8 sm:py-12 px-4 sm:px-6 md:px-8">
          <PopularVillas />
        </div>
      </main>
    </>
  );
};
