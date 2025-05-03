import { ImageResponse } from 'next/og'
import Image from 'next/image'
// Next.js 15 ile uyumlu OpenGraph resmi yapılandırması
export const runtime = 'edge'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Açık resmi oluşturma fonksiyonu
export default async function OpenGraphImage(): Promise<ImageResponse> {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(to bottom, #ffffff, #f0f0f0)',
          padding: 50,
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: '"Nunito", "Montserrat", sans-serif',
        }}
      >
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <Image
            src="https://www.innelegance.com/logo-siyah.svg"
            width={300}
            height={100}
            alt="Inn Elegance Logo"
            style={{ margin: 'auto' }}
          />
        </div>
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '30px 50px',
            borderRadius: 15,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h1 
            style={{
              fontSize: 60,
              fontWeight: 'bold',
              textAlign: 'center',
              margin: 0,
              color: '#1e293b',
            }}
          >
            Türkiye&apos;de Havuzlu Lüks Villa Kiralama
          </h1>
          <p 
            style={{ 
              fontSize: 30,
              textAlign: 'center',
              margin: '20px 0 0 0',
              color: '#64748b',
            }}
          >
            Antalya, Fethiye, Kalkan, Bodrum ve diğer bölgelerde uygun fiyatlı muhafazakar villa kiralama
          </p>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
} 