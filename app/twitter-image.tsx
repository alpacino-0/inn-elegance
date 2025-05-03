import { ImageResponse } from 'next/og'
import Image from 'next/image'
export const runtime = 'edge'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
export const alt = 'Inn Elegance - Antalya, Fethiye, Kaş, Bodrum ve Kalkan\'da lüks villa kiralama hizmeti'

// Twitter Card için resim oluşturma fonksiyonu
export default async function TwitterImage() {
  try {
    // Font verilerini yükle
    const nunitoFont = fetch(
      new URL('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600&display=swap'), 
      {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    ).then((res) => res.arrayBuffer())
    
    const montserratFont = fetch(
      new URL('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=swap'),
      {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    ).then((res) => res.arrayBuffer())

    // Font verilerini paralel olarak yükle
    const [nunitoFontData, montserratFontData] = await Promise.all([
      nunitoFont,
      montserratFont,
    ])

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundImage: 'linear-gradient(to bottom right, #100049, #180675)',
            padding: 50,
            justifyContent: 'center',
            alignItems: 'center',
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
              alt="Inn Elegance Villa Kiralama"
              style={{ 
                margin: 'auto',
                filter: 'brightness(0) invert(1)'
              }}
            />
          </div>
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.93)',
              padding: '30px 50px',
              borderRadius: 15,
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h1 
              style={{
                fontSize: 60,
                fontWeight: 'bold',
                textAlign: 'center',
                margin: 0,
                color: '#100049', // Marka Primary rengi
              }}
            >
              Lüks Villa Kiralama
            </h1>
            <p 
              style={{ 
                fontSize: 28,
                textAlign: 'center',
                margin: '15px 0 0 0',
                color: '#000000', // Marka ana metin rengi
                fontWeight: 600,
              }}
            >
              Antalya • Fethiye • Kalkan • Bodrum • Marmaris • Kaş
            </p>
            <p 
              style={{ 
                fontSize: 24,
                textAlign: 'center',
                margin: '12px 0 0 0',
                color: '#180675', // Marka Secondary rengi
                fontWeight: 500,
              }}
            >
              Havuzlu, Muhafazakar & Uygun Fiyatlı Tatil Villaları
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '15px 0 0 0',
              }}
            >
              <p
                style={{
                  fontSize: 20,
                  color: '#000000',
                  fontWeight: 400,
                  padding: '8px 15px',
                  backgroundColor: 'rgba(24, 6, 117, 0.1)',
                  borderRadius: 25,
                  margin: '0 5px',
                }}
              >
                Inn Elegance
              </p>
              <p
                style={{
                  fontSize: 20,
                  color: '#000000',
                  fontWeight: 400,
                  padding: '8px 15px',
                  backgroundColor: 'rgba(24, 6, 117, 0.1)',
                  borderRadius: 25,
                  margin: '0 5px',
                }}
              >
                Tatilin Lüks Yüzü
              </p>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          {
            name: 'Nunito',
            data: nunitoFontData,
            style: 'normal',
            weight: 300,
          },
          {
            name: 'Nunito',
            data: nunitoFontData,
            style: 'normal',
            weight: 400,
          },
          {
            name: 'Nunito',
            data: nunitoFontData,
            style: 'normal',
            weight: 500,
          },
          {
            name: 'Nunito',
            data: nunitoFontData,
            style: 'normal',
            weight: 600,
          },
          {
            name: 'Montserrat',
            data: montserratFontData,
            style: 'normal',
            weight: 600,
          },
          {
            name: 'Montserrat',
            data: montserratFontData,
            style: 'normal',
            weight: 700,
          },
        ],
      }
    )
  } catch (error) {
    console.error('Twitter imajı oluşturma hatası:', error)
    
    // Hata durumunda marka renklerini kullanan yedek görüntü
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundImage: 'linear-gradient(to bottom right, #100049, #180675)',
            padding: 50,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.93)',
              padding: '30px 50px',
              borderRadius: 15,
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h1 
              style={{
                fontSize: 60,
                fontWeight: 'bold',
                textAlign: 'center',
                margin: 0,
                color: '#100049',
              }}
            >
              Lüks Villa Kiralama
            </h1>
            <p 
              style={{ 
                fontSize: 28,
                textAlign: 'center',
                margin: '15px 0 0 0',
                color: '#000000',
              }}
            >
              Inn Elegance | Tatil Villa Kiralama Hizmeti
            </p>
          </div>
        </div>
      ),
      {
        ...size,
      }
    )
  }
} 