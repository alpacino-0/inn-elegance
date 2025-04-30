# Villa Resimleri Yükleme Rehberi

Bu rehber, villa resimlerinin sisteme nasıl yükleneceğini ve yönetileceğini açıklar. Sistemimizdeki villa resimleri aşağıdaki özelliklere sahiptir ve bu kurallara uygun şekilde düzenlenmelidir.

## Resim Özellikleri ve Veri Yapısı

Villa resimleri, veritabanımızda aşağıdaki alanlarla saklanır:

| Alan | Tip | Zorunlu | Varsayılan | Açıklama |
|------|-----|---------|------------|----------|
| id | UUID | Evet | Otomatik | Resim kaydının benzersiz tanımlayıcısı |
| villaId | UUID | Evet | - | Resmin ait olduğu villanın ID'si |
| imageUrl | Text | Evet | - | Resmin tam URL adresi |
| title | Text | Hayır | null | Resim için başlık (görüntüleme amaçlı) |
| altText | Text | Hayır | null | SEO ve erişilebilirlik için alternatif metin |
| order | Integer | Evet | 0 | Resimlerin gösterim sırası |
| isCoverImage | Boolean | Evet | false | Kapak resmi olup olmadığı |
| createdAt | Timestamp | Evet | now() | Resmin yüklenme tarihi ve saati |

## Resim Yükleme Kuralları

1. **Dosya Formatı**: Resimler JPG, PNG veya WEBP formatında olmalıdır.
2. **Boyut Sınırlaması**: Dosya boyutu 5MB'ı geçmemelidir.
3. **Çözünürlük**: Optimum görüntü kalitesi için en az 1200x800 piksel çözünürlük önerilir.
4. **En-Boy Oranı**: Villa resimlerinin ideal en-boy oranı 3:2'dir.

## Kapak Resmi (Cover Image) Yönetimi

Her villa için **yalnızca bir adet** kapak resmi bulunabilir. Kapak resmi:

- Listelemelerde ilk gösterilen resimdir
- Villa kartlarında görüntülenen ana resimdir
- Sosyal medya paylaşımlarında kullanılan varsayılan resimdir

Bir resmi kapak resmi olarak ayarladığınızda, önceki kapak resmi otomatik olarak sıfırlanır.

## Resim Sıralaması

Resimler `order` alanındaki değere göre sıralanır:

- Düşük değerler (0, 1, 2...) resmin önce görüntülenmesini sağlar
- Kapak resmi her zaman ilk sırada görüntülenir (`order` değerinden bağımsız olarak)
- Aynı `order` değerine sahip resimler yüklenme tarihine göre sıralanır

## SEO Optimizasyonu

Resimleri SEO açısından optimize etmek için:

- Her resme anlamlı bir `title` atayın
- `altText` alanını villa özelliklerini tanımlayan anahtar kelimelerle doldurun
- Dosya adlarında özel karakterler ve boşluk kullanmaktan kaçının

## Teknik Notlar

- Resimler, villa silindiğinde otomatik olarak silinir (cascade delete)
- Veritabanında villa ID'sine göre indeksleme yapılmıştır
- Kapak resimlerine hızlı erişim için `isCoverImage` alanında indeks bulunur

## En İyi Uygulamalar

1. Her villa için en az 5 resim yükleyin
2. Farklı açılardan çekilmiş resimler kullanın (dış görünüm, oda içi, havuz, vb.)
3. Yüksek kaliteli ve profesyonel çekilmiş fotoğraflar kullanın
4. Resimleri anlamlı bir sırayla düzenleyin (dış görünüm → iç mekanlar → detaylar)
5. Mevsimsel çekimler varsa, güncel olanların öncelikli görüntülenmesini sağlayın 