import type { Metadata } from 'next';

// Villa kiralama sayfası için özel metadata yapılandırması
export const metadata: Metadata = {
  title: 'Villa Kiralama | Tatil Villaları | Inn Elegance',
  description: 'Antalya, Fethiye, Kalkan, Bodrum, Marmaris ve Kaş\'ta havuzlu, muhafazakar ve uygun fiyatlı lüks villa kiralama hizmeti. Tatiliniz için en iyi villaları keşfedin.',
  keywords: 'villa kiralama, antalya villa kiralama, fethiye villa kiralama, kalkan villa kiralama, bodrum villa kiralama, kaş villa kiralama, havuzlu villa kiralama, muhafazakar villa kiralama, tatil villa kiralama, uygun villa kiralama',
  openGraph: {
    title: 'Villa Kiralama | Inn Elegance',
    description: 'Antalya, Fethiye, Kalkan, Bodrum, Marmaris ve Kaş\'ta havuzlu, muhafazakar ve uygun fiyatlı lüks villa kiralama hizmeti.',
    url: 'https://www.innelegance.com/villa-kiralama',
    siteName: 'Inn Elegance',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: 'https://www.innelegance.com/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Inn Elegance - Lüks Villa Kiralama',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Villa Kiralama | Inn Elegance',
    description: 'Türkiye\'nin en güzel bölgelerinde havuzlu, muhafazakar ve uygun fiyatlı villa kiralama hizmeti.',
    creator: '@innelegance',
    images: ['https://www.innelegance.com/twitter-image.png'],
  },
  alternates: {
    canonical: 'https://www.innelegance.com/villa-kiralama',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'tatil',
  other: {
    'fb:app_id': '12345678910', // Facebook uygulama ID'nizi buraya ekleyin
    'format-detection': 'telephone=no',
    'google-site-verification': 'your-verification-code', // Google doğrulama kodunuzu buraya ekleyin
  },
}; 