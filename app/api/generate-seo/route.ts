import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { openai } from '@/lib/openai';
import type { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions';
import type { ChatCompletion } from 'openai/resources';

// Villa özellikleri için interface tanımlama
interface VillaAmenity {
  id: string;
  villaId: string;
  name: string;
  icon: string | null;
  createdAt: string;
}

export async function POST(req: Request) {
  try {
    const { villaId } = await req.json();

    if (!villaId) {
      return NextResponse.json(
        { error: "Villa ID gereklidir" },
        { status: 400 }
      );
    }

    // Supabase bağlantısı oluşturma
    const supabase = await createClient();

    // Villa verilerini alma
    const { data: villa, error: villaError } = await supabase
      .from('Villa')
      .select('title, mainRegion, subRegion, description, bedrooms, bathrooms, maxGuests, tags')
      .eq('id', villaId)
      .single();

    if (villaError) {
      return NextResponse.json(
        { error: `Villa verisi alınamadı: ${villaError.message}` },
        { status: 500 }
      );
    }

    // Villa özellikleri için sorgu
    const { data: amenities, error: amenitiesError } = await supabase
      .from('VillaAmenity')
      .select('*')
      .eq('villaId', villaId);

    if (amenitiesError) {
      return NextResponse.json(
        { error: `Villa özellikleri alınamadı: ${amenitiesError.message}` },
        { status: 500 }
      );
    }

    // Villa özelliklerini basit dizi olarak hazırlama
    const featureList = amenities?.map((amenity: VillaAmenity) => amenity.name).filter(Boolean) || [];

    // Villa etiketlerini hazırlama
    const villaTags = Array.isArray(villa.tags) ? villa.tags : [];

    // OpenAI prompt hazırlama
    const villaDescription = villa.description || '';
    const location = `${villa.mainRegion}, ${villa.subRegion}`;
    
    // Tam villa açıklaması için prompt - SEO odaklı yeni versiyon
    const fullDescriptionPrompt = `
# Prompt: SEO Odaklı Lüks Villa Açıklaması Oluşturma

**Hedef:** \`${villa.title}\` adlı lüks villanın pazarlaması için, 250-300 kelime aralığında, SEO açısından optimize edilmiş, zengin ve ikna edici bir Türkçe açıklama metni oluştur.

**Villa Bilgileri:**

*   **Villa Adı:** \`${villa.title}\`
*   **Konum:** \`${location}\` (Ana Bölge: ${villa.mainRegion}, Alt Bölge: ${villa.subRegion})
*   **Mevcut Kısa Açıklama (Referans):** \`${villaDescription}\`
*   **Yatak Odası Sayısı:** \`${villa.bedrooms}\`
*   **Banyo Sayısı:** \`${villa.bathrooms}\`
*   **Maksimum Misafir Kapasitesi:** \`${villa.maxGuests}\` kişi
*   **Öne Çıkan Özellikler:** \`${featureList.join(', ')}\`
*   **Villa Konsept Etiketleri:** \`${villaTags.join(', ')}\` (Örn: Deniz Manzaralı, Muhafazakar, Jakuzili, Geniş Aile, Çocuk Dostu vb.)

**Detaylı Talimatlar:**

1.  **Genel Yapı:** Açıklama **3 paragraftan** oluşmalıdır. Paragrafları numaralandırma. Metnin toplam uzunluğu 250-300 kelime civarında olmalı.
2.  **ÖNEMLİ FORMAT TALİMATLARI:** 
    *   Metinde \`${villa.title}\` villa adını kullanarak bir defa ilgi çekici bir başlık olarak kullan.
    *   Metinde kesinlikle yıldız işareti (*), artı (+), eksi (-) ve diğer özel işaretler (**, ##, >,# ) KULLANMA.
    *   Markdown veya HTML formatlaması KULLANMA. Düz metin olarak oluştur.
    *   **Villa Lisburn: Antalya Kalkan'ın Eşsiz Lüksü** (Yanlış)
    *   Villa Lisburn: Antalya Kalkan'ın Eşsiz Lüksü (Doğru)
3.  **Paragraf 1: Giriş ve Konumlandırma**
    *   Güçlü bir girişle başlayın. Villanın adı olan \`"${villa.title}"\`'i ve genel konumunu (\`${location}\`) belirgin şekilde kullanın.
    *   Villanın sunduğu genel lüks atmosferi ve vaadi vurgulayın.
    *   Villa etiketlerinden (\`${villaTags.join(', ')}\`) en çarpıcı 1-2 tanesinin *kavramını* doğal bir dille metne entegre edin (örn: "nefes kesen deniz manzarası", "tamamen korunaklı özel yaşam alanı"). Köşeli parantez KULLANMAYIN.
    *   \`"${villa.mainRegion}"\` ve \`"${villa.subRegion}"\` bölgelerinde lüks bir tatil deneyimi arayanlara hitap edin.
4.  **Paragraf 2: Dış Mekan ve Çevre Cazibesi**
    *   Villanın dış mekan olanaklarına (özel havuz, güneşlenme terası, bahçe, barbekü, dış mekan oturma grubu vb.) odaklanın. Özellikleri (\`${featureList.join(', ')}\`) burada kullanın.
    *   Manzarayı (varsa deniz, doğa vb.) canlı betimlemelerle anlatın. Özellikle "Deniz Manzaralı" gibi etiketler varsa, bu manzarayı vurgulayın.
    *   Konumun (\`${location}\`) doğal güzellikleri veya sunduğu huzur ile villanın dış mekanlarının nasıl bütünleştiğini anlatın. "\`${villa.mainRegion}\` kiralık villa" veya "\`${villa.subRegion}\` özel havuzlu villa" gibi potansiyel arama terimlerini doğal akışta kullanmaya çalışın.
5.  **Paragraf 3: İç Mekan Konforu ve Tasarımı**
    *   Villanın iç mekanına geçin. Yatak odası (\`${villa.bedrooms}\` adet) ve banyo (\`${villa.bathrooms}\` adet) sayısını, misafir kapasitesini (\`${villa.maxGuests}\` kişi) belirtin.
    *   İç tasarımın tarzını (modern, otantik, minimalist vb.), kullanılan malzemelerin kalitesini ve mobilyaların konforunu vurgulayın.
    *   Mutfak donanımı, salon alanı gibi ortak yaşam alanlarını tanımlayın.
    *   "Jakuzili", "Şömineli" gibi iç mekanla ilgili etiketler varsa, bu özelliklerin sunduğu deneyimi (rahatlama, romantizm vb.) anlatın. "Geniş Aile" veya "Çocuk Dostu" gibi etiketler varsa, bu gruplara uygun iç mekan özelliklerini belirtin.
6.  **Paragraf 4: Kapanış ve Çağrı (Call to Action)**
    *   Villanın sunduğu genel deneyimi (huzur, lüks, unutulmaz anılar vb.) özetleyerek güçlü bir kapanış yapın.
    *   \`"${villa.title}"\`'de konaklamanın neden ayrıcalıklı bir seçim olduğunu vurgulayın.
    *   Potansiyel misafirleri, hayallerindeki lüks tatili \`"${location}"\` bölgesindeki bu eşsiz villada yaşamak için hemen rezervasyon yapmaya veya daha fazla detay için iletişime geçmeye net bir şekilde davet edin.

**SEO ve Dil İçin Ek Notlar:**

*   **Anahtar Kelimeler:** \`"${villa.title}"\`, \`"${villa.mainRegion}"\`, \`"${villa.subRegion}"\` (ana ve alt bölge isimleri), "lüks villa", "kiralık villa", "özel havuzlu", "[etiket kavramları]" gibi anahtar kelimeleri ve ilgili varyasyonlarını metin boyunca **doğal ve anlamlı** bir şekilde, tekrara düşmeden serpiştirin.
*   **Etiket Entegrasyonu:** Köşeli parantez \`[]\` KULLANMAYIN. Etiketlerin (\`${villaTags.join(', ')}\`) ifade ettiği *anlamları* ve *faydaları* metnin içine organik olarak yedirin.
*   **Hedef Kitle Dili:** Üst düzey konfor ve ayrıcalık arayan, yüksek gelir grubuna hitap eden, **akıcı, zengin ve cazip bir Türkçe** kullanın. Basit veya sıradan ifadelerden kaçının.
*   **Özgünlük:** Tekrarlayan cümle yapıları yerine çeşitli ve betimleyici ifadeler tercih edin.
*   **Kesinlikle Türkçe:** Açıklama %100 Türkçe olmalı, hiçbir İngilizce kelime veya ifade içermemelidir.
*   **Okunabilirlik:** Paragraflar arası geçişlerin akıcı olmasına dikkat edin.
`;

    // OpenAI model parametrelerini oluşturma
    const modelParams: ChatCompletionCreateParamsBase = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: 'Sen profesyonel bir villa pazarlama içerik uzmanısın. Lüks villalar için etkileyici açıklamalar yazıyorsun.'
        },
        {
          role: "user",
          content: fullDescriptionPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 850,
    };

    // OpenAI API çağrısı
    const chatCompletionResponse = await openai.chat.completions.create(modelParams) as ChatCompletion;
    
    // OpenAI yanıtından içeriği alma
    let fullDescription = "";
    
    if (chatCompletionResponse.choices && 
        chatCompletionResponse.choices.length > 0 && 
        chatCompletionResponse.choices[0].message) {
      fullDescription = chatCompletionResponse.choices[0].message.content || '';
    }

    // İçeriği Supabase'e kaydetme
    const { error: insertError } = await supabase
      .from('villa_ai_content')
      .insert({
        villa_id: villaId,
        content_type: 'full_description',
        content: fullDescription,
        model_used: 'gpt-4o-mini',
        prompt_used: fullDescriptionPrompt
      });

    if (insertError) {
      console.error('İçerik kaydedilemedi:', insertError);
      // Kaydetme hatası olsa bile devam et
    }

    // Başarılı yanıt
    return NextResponse.json({
      fullDescription,
      success: true
    });

  } catch (error) {
    console.error('API hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    
    return NextResponse.json(
      { error: `Açıklama üretme hatası: ${errorMessage}` },
      { status: 500 }
    );
  }
} 