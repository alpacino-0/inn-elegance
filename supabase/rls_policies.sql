-- ==================== RLS POLİTİKALARI ====================
-- Row Level Security politikaları, kullanıcı rollerine göre veri erişimini kontrol eder.
-- Bu script, villa rezervasyon sistemi için gerekli tüm güvenlik politikalarını oluşturur.

-- ==================== RLS'Yİ TÜM TABLOLAR İÇİN ETKİNLEŞTİR ====================

-- Ana tablolar
ALTER TABLE "public"."Villa" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Region" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Currency" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;

-- İlişkisel tablolar
ALTER TABLE "public"."SeasonalPrice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Reservation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ReservationPriceDetail" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."VillaImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."VillaAmenity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."VillaTag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."FormSubmission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."SeoMetadata" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."CalendarEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."AdminActivityLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."CurrencyUpdateLog" ENABLE ROW LEVEL SECURITY;

-- ==================== VILLA TABLOSU POLİTİKALARI ====================

-- 1. Okuma Politikası: Herkes villaları görüntüleyebilir
CREATE POLICY "Villa verilerini herkes okuyabilir" 
ON "public"."Villa" FOR SELECT 
USING (true);

-- 2. Yazma Politikası: Sadece admin kullanıcılar villa ekleyebilir
CREATE POLICY "Villa ekleme yetkisi admin kullanıcılarına verilmiştir" 
ON "public"."Villa" FOR INSERT 
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

-- 3. Güncelleme Politikası: Sadece admin kullanıcılar villa güncelleyebilir
CREATE POLICY "Villa güncelleme yetkisi admin kullanıcılarına verilmiştir" 
ON "public"."Villa" FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN')
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

-- 4. Silme Politikası: Sadece admin kullanıcılar villa silebilir
CREATE POLICY "Villa silme yetkisi admin kullanıcılarına verilmiştir" 
ON "public"."Villa" FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');

-- ==================== REZERVASYON TABLOSU POLİTİKALARI ====================

-- 1. Admin Okuma Politikası: Admin kullanıcılar tüm rezervasyonları okuyabilir
CREATE POLICY "Admin kullanıcılar tüm rezervasyonları okuyabilir" 
ON "public"."Reservation" FOR SELECT 
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');

-- 2. Müşteri Okuma Politikası: Müşteriler sadece kendi rezervasyonlarını okuyabilir
CREATE POLICY "Müşteriler sadece kendi rezervasyonlarını okuyabilir" 
ON "public"."Reservation" FOR SELECT 
TO authenticated
USING (auth.uid()::text = "userId" AND auth.jwt() ->> 'role' = 'CUSTOMER');

-- 3. Admin Yazma Politikası: Admin kullanıcılar rezervasyon ekleyebilir
CREATE POLICY "Admin kullanıcılar rezervasyon ekleyebilir" 
ON "public"."Reservation" FOR INSERT 
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

-- 4. Müşteri Yazma Politikası: Müşteriler kendi rezervasyonlarını ekleyebilir
CREATE POLICY "Müşteriler rezervasyon ekleyebilir" 
ON "public"."Reservation" FOR INSERT 
TO authenticated
WITH CHECK (auth.uid()::text = "userId" AND auth.jwt() ->> 'role' = 'CUSTOMER');

-- 5. Admin Güncelleme Politikası: Admin kullanıcılar tüm rezervasyonları güncelleyebilir
CREATE POLICY "Admin kullanıcılar tüm rezervasyonları güncelleyebilir" 
ON "public"."Reservation" FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN')
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

-- 6. Müşteri Güncelleme Politikası: Müşteriler sadece kendi rezervasyonlarını güncelleyebilir
CREATE POLICY "Müşteriler sadece kendi rezervasyonlarını güncelleyebilir" 
ON "public"."Reservation" FOR UPDATE
TO authenticated
USING (auth.uid()::text = "userId" AND auth.jwt() ->> 'role' = 'CUSTOMER')
WITH CHECK (auth.uid()::text = "userId" AND auth.jwt() ->> 'role' = 'CUSTOMER');

-- 7. Admin Silme Politikası: Sadece admin kullanıcılar rezervasyon silebilir
CREATE POLICY "Admin kullanıcılar rezervasyon silebilir" 
ON "public"."Reservation" FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');

-- ==================== DEĞERLENDİRME (REVIEW) TABLOSU POLİTİKALARI ====================

-- 1. Genel Okuma Politikası: Herkes onaylanmış değerlendirmeleri okuyabilir
CREATE POLICY "Herkes onaylanmış değerlendirmeleri okuyabilir" 
ON "public"."Review" FOR SELECT 
USING ("isApproved" = true);

-- 2. Admin Okuma Politikası: Admin kullanıcılar tüm değerlendirmeleri okuyabilir
CREATE POLICY "Admin kullanıcılar tüm değerlendirmeleri okuyabilir" 
ON "public"."Review" FOR SELECT 
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');

-- 3. Müşteri Okuma Politikası: Müşteriler kendi değerlendirmelerini okuyabilir
CREATE POLICY "Müşteriler kendi değerlendirmelerini okuyabilir" 
ON "public"."Review" FOR SELECT 
TO authenticated
USING (auth.uid()::text = "userId");

-- 4. Müşteri Yazma Politikası: Müşteriler değerlendirme ekleyebilir
CREATE POLICY "Müşteriler değerlendirme ekleyebilir" 
ON "public"."Review" FOR INSERT 
TO authenticated
WITH CHECK (auth.uid()::text = "userId");

-- 5. Admin Güncelleme Politikası: Admin kullanıcılar tüm değerlendirmeleri güncelleyebilir
CREATE POLICY "Admin kullanıcılar tüm değerlendirmeleri güncelleyebilir" 
ON "public"."Review" FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN')
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

-- 6. Müşteri Güncelleme Politikası: Müşteriler kendi değerlendirmelerini güncelleyebilir
CREATE POLICY "Müşteriler kendi değerlendirmelerini güncelleyebilir" 
ON "public"."Review" FOR UPDATE
TO authenticated
USING (auth.uid()::text = "userId")
WITH CHECK (auth.uid()::text = "userId");

-- 7. Admin Silme Politikası: Admin kullanıcılar değerlendirme silebilir
CREATE POLICY "Admin kullanıcılar değerlendirme silebilir" 
ON "public"."Review" FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');

-- ==================== KULLANICI (USER) TABLOSU POLİTİKALARI ====================

-- 1. Admin Okuma Politikası: Admin kullanıcılar tüm kullanıcıları okuyabilir
CREATE POLICY "Admin kullanıcılar tüm kullanıcıları okuyabilir" 
ON "public"."User" FOR SELECT 
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');

-- 2. Kullanıcı Okuma Politikası: Kullanıcılar kendi bilgilerini okuyabilir
CREATE POLICY "Kullanıcılar kendi bilgilerini okuyabilir" 
ON "public"."User" FOR SELECT 
TO authenticated
USING (auth.uid()::text = id);

-- 3. Admin Yazma Politikası: Admin kullanıcılar kullanıcı ekleyebilir
CREATE POLICY "Admin kullanıcılar kullanıcı ekleyebilir" 
ON "public"."User" FOR INSERT 
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

-- 4. Admin Güncelleme Politikası: Admin kullanıcılar tüm kullanıcıları güncelleyebilir
CREATE POLICY "Admin kullanıcılar tüm kullanıcıları güncelleyebilir" 
ON "public"."User" FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN')
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

-- 5. Kullanıcı Güncelleme Politikası: Kullanıcılar kendi bilgilerini güncelleyebilir
CREATE POLICY "Kullanıcılar kendi bilgilerini güncelleyebilir" 
ON "public"."User" FOR UPDATE
TO authenticated
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);

-- 6. Admin Silme Politikası: Admin kullanıcılar kullanıcı silebilir
CREATE POLICY "Admin kullanıcılar kullanıcı silebilir" 
ON "public"."User" FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');

-- ==================== GENEL VERİ TABLOLARI İÇİN POLİTİKALAR ====================
-- Bölge, Para Birimi, Villa Görselleri vb. için

-- REGION (BÖLGE) TABLOSU
-- 1. Okuma Politikası: Herkes bölge verilerini okuyabilir
CREATE POLICY "Herkes bölge verilerini okuyabilir" 
ON "public"."Region" FOR SELECT 
USING (true);

-- 2-4. Yazma/Güncelleme/Silme: Sadece admin
CREATE POLICY "Sadece admin bölge ekleyebilir" 
ON "public"."Region" FOR INSERT 
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Sadece admin bölge güncelleyebilir" 
ON "public"."Region" FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN')
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Sadece admin bölge silebilir" 
ON "public"."Region" FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');

-- CURRENCY (PARA BİRİMİ) TABLOSU
-- 1. Okuma Politikası: Herkes para birimi verilerini okuyabilir
CREATE POLICY "Herkes para birimi verilerini okuyabilir" 
ON "public"."Currency" FOR SELECT 
USING (true);

-- 2-4. Yazma/Güncelleme/Silme: Sadece admin
CREATE POLICY "Sadece admin para birimi ekleyebilir" 
ON "public"."Currency" FOR INSERT 
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Sadece admin para birimi güncelleyebilir" 
ON "public"."Currency" FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN')
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Sadece admin para birimi silebilir" 
ON "public"."Currency" FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');

-- VILLAIMAGES (VİLLA GÖRSELLERİ) TABLOSU
-- 1. Okuma Politikası: Herkes villa görsellerini okuyabilir
CREATE POLICY "Herkes villa görsellerini okuyabilir" 
ON "public"."VillaImage" FOR SELECT 
USING (true);

-- 2-4. Yazma/Güncelleme/Silme: Sadece admin
CREATE POLICY "Sadece admin villa görseli ekleyebilir" 
ON "public"."VillaImage" FOR INSERT 
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Sadece admin villa görseli güncelleyebilir" 
ON "public"."VillaImage" FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN')
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Sadece admin villa görseli silebilir" 
ON "public"."VillaImage" FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');

-- Bu şekilde diğer tüm tablolar için benzer politikalar eklenmelidir:
-- SEASONALPRICE, VILLAAMENITY, VILLATAG, CALENDAREVENTS, vb.

-- ==================== ADMİN TABLOLARI İÇİN POLİTİKALAR ====================
-- AdminActivityLog ve CurrencyUpdateLog gibi yönetici tablolarına sadece
-- admin kullanıcıların erişimine izin verilir.

-- ADMINACTIVITYLOG TABLOSU
-- 1. Okuma: Sadece admin
CREATE POLICY "Sadece admin aktivite loglarını okuyabilir" 
ON "public"."AdminActivityLog" FOR SELECT 
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');

-- 2-4. Yazma/Güncelleme/Silme: Sadece admin
CREATE POLICY "Sadece admin aktivite logu ekleyebilir" 
ON "public"."AdminActivityLog" FOR INSERT 
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Sadece admin aktivite logu güncelleyebilir" 
ON "public"."AdminActivityLog" FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN')
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Sadece admin aktivite logu silebilir" 
ON "public"."AdminActivityLog" FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');

-- CURRENCYUPDATELOG TABLOSU
-- 1. Okuma: Sadece admin
CREATE POLICY "Sadece admin para birimi güncelleme loglarını okuyabilir" 
ON "public"."CurrencyUpdateLog" FOR SELECT 
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');

-- 2-4. Yazma/Güncelleme/Silme: Sadece admin
CREATE POLICY "Sadece admin para birimi güncelleme logu ekleyebilir" 
ON "public"."CurrencyUpdateLog" FOR INSERT 
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Sadece admin para birimi güncelleme logu güncelleyebilir" 
ON "public"."CurrencyUpdateLog" FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN')
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Sadece admin para birimi güncelleme logu silebilir" 
ON "public"."CurrencyUpdateLog" FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');

-- RESERVATIONPRICEDETAIL TABLOSU
-- 1. Okuma: Admin tümünü, müşteriler kendilerininkini
CREATE POLICY "Admin tüm rezervasyon fiyat detaylarını okuyabilir" 
ON "public"."ReservationPriceDetail" FOR SELECT 
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Müşteriler kendi rezervasyon fiyat detaylarını okuyabilir" 
ON "public"."ReservationPriceDetail" FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM "public"."Reservation" 
  WHERE "public"."Reservation"."id" = "public"."ReservationPriceDetail"."reservationId" 
  AND "public"."Reservation"."userId" = auth.uid()::text
));

-- 2-4. Yazma/Güncelleme/Silme: Sadece admin
CREATE POLICY "Sadece admin rezervasyon fiyat detayı ekleyebilir" 
ON "public"."ReservationPriceDetail" FOR INSERT 
TO authenticated
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Sadece admin rezervasyon fiyat detayı güncelleyebilir" 
ON "public"."ReservationPriceDetail" FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN')
WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Sadece admin rezervasyon fiyat detayı silebilir" 
ON "public"."ReservationPriceDetail" FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN'); 