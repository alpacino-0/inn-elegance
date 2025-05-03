import type { Metadata } from 'next'

const title = 'Inn Elegance - Lüks Villa Kiralama'
const description = 'Türkiye\'nin en güzel bölgelerinde Antalya, Fethiye, Kaş, Kalkan, Bodrum ve daha birçok bölgede havuzlu, muhafazakar ve uygun fiyatlı lüks villa kiralama hizmeti sunan Inn Elegance ile unutulmaz bir tatil deneyimi yaşayın.'
const baseUrl = 'https://www.innelegance.com'

export const metadata: Metadata = {
  title: {
    default: title,
    template: '%s | Inn Elegance',
  },
  description,
  keywords: [
    // Yüksek arama hacimli ana anahtar kelimeler
    'villa kiralama',
    'kalkan villa kiralama',
    'fethiye villa kiralama',
    'kaş villa kiralama',
    'tatil villa kiralama',
    'havuzlu villa kiralama',
    'uygun villa kiralama',
    
    // Şehir bazlı anahtar kelimeler (yüksek arama hacimli)
    'antalya villa kiralama',
    'fethiye villa kiralama',
    'kaş villa kiralama',
    'muğla villa kiralama',
    'kalkan villa kiralama',
    'bodrum villa kiralama',
    'sapanca villa kiralama',
    'izmir villa kiralama',
    'mersin villa kiralama',
    'alanya villa kiralama',
    'marmaris villa kiralama',
    'kuşadası villa kiralama',
    
    // Niş anahtar kelimeler
    'muhafazakar villa kiralama',
    'lüks villa',
    'özel havuzlu villa',
    'deniz manzaralı villa',
    'yazlık kiralama',
    'tatil evi',
    'Türkiye villa kiralama',
    'Inn Elegance',
    'villa kiralama fethiye',
  ],
  authors: [
    { name: 'Inn Elegance', url: baseUrl }
  ],
  creator: 'Inn Elegance',
  publisher: 'Inn Elegance',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/',
    languages: {
      'tr-TR': '/',
    },
  },
  openGraph: {
    title,
    description,
    url: baseUrl,
    siteName: 'Inn Elegance',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: 'Inn Elegance - Lüks Villa Kiralama',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    creator: '@innelegance',
    images: [`${baseUrl}/twitter-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'Vc_SHpDfEKcmM1nVxIbd_ODzxXlk9QJ0WLovNYah2bE',
  },
  category: 'Travel & Tourism',
} 