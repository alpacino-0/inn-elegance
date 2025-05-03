import type { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.innelegance.com'

  // Statik sayfalar
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/villa-kiralama`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/villa-kiralama-hakkimizda`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/villa-kiralama-iletisim`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/villa-kiralama-hizmetler`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/villa-kiralama-sikca-sorulan-sorular`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/villa-kiralama-gizlilik-sartlari`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/villa-kiralama-iptal-kosullari`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/villa-kiralama-sozlesmesi`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/kisisel-verilerin-korunmasi-hakkinda-aydinlatma-metni`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    },
  ]

  // Dinamik villa sayfaları için Supabase'den slug verilerini çek
  const supabase = await createClient()
  
  // Sadece aktif villaların slug'larını al
  const { data: villas, error } = await supabase
    .from('Villa')
    .select('slug, updatedAt')
    .eq('status', 'ACTIVE')
  
  if (error) {
    console.error('Villa slug verileri çekilirken hata oluştu:', error.message)
    // Hata durumunda sadece statik sayfaları döndür
    return staticPages
  }
  
  // Dinamik villa sayfaları için sitemap girişleri oluştur
  const dynamicVillaPages = villas.map(villa => ({
    url: `${baseUrl}/villa-kiralama/${villa.slug}`,
    lastModified: villa.updatedAt ? new Date(villa.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  
  // Statik ve dinamik sayfaları birleştir
  return [...staticPages, ...dynamicVillaPages]
} 