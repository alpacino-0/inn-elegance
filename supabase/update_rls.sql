-- Mevcut RLS politikalarını kontrol et ve güncelle
-- Bu script, politika çakışmalarını önlemek için önce var olan politikaları kontrol eder

-- Mevcut politikayı kaldır (eğer varsa)
DROP POLICY IF EXISTS "Villa verilerini herkes okuyabilir" ON "public"."Villa";
DROP POLICY IF EXISTS "Villa ekleme yetkisi admin kullanıcılarına verilmiştir" ON "public"."Villa";
DROP POLICY IF EXISTS "Villa güncelleme yetkisi admin kullanıcılarına verilmiştir" ON "public"."Villa";
DROP POLICY IF EXISTS "Villa silme yetkisi admin kullanıcılarına verilmiştir" ON "public"."Villa";

-- Yeni politikaları oluştur
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

-- _UserFavorites tablosu için politikaları kontrol et
DROP POLICY IF EXISTS "Admin tüm kullanıcı favorilerini okuyabilir" ON "public"."_UserFavorites";
DROP POLICY IF EXISTS "Kullanıcılar kendi favorilerini okuyabilir" ON "public"."_UserFavorites";
DROP POLICY IF EXISTS "Kullanıcılar kendi favorilerini ekleyebilir" ON "public"."_UserFavorites";
DROP POLICY IF EXISTS "Kullanıcılar kendi favorilerini silebilir" ON "public"."_UserFavorites";
DROP POLICY IF EXISTS "Admin tüm favori kayıtlarını silebilir" ON "public"."_UserFavorites";

-- _UserFavorites RLS'yi etkinleştir (eğer etkin değilse)
ALTER TABLE "public"."_UserFavorites" ENABLE ROW LEVEL SECURITY;

-- _UserFavorites için yeni politikaları ekle
-- 1. Okuma Politikası: Admin tüm kullanıcı favorilerini okuyabilir
CREATE POLICY "Admin tüm kullanıcı favorilerini okuyabilir" 
ON "public"."_UserFavorites" FOR SELECT 
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN');

-- 2. Okuma Politikası: Kullanıcılar kendi favorilerini okuyabilir
CREATE POLICY "Kullanıcılar kendi favorilerini okuyabilir" 
ON "public"."_UserFavorites" FOR SELECT 
TO authenticated
USING ("A" = auth.uid()::text);

-- 3. Yazma Politikası: Kullanıcılar kendi favorilerini ekleyebilir
CREATE POLICY "Kullanıcılar kendi favorilerini ekleyebilir" 
ON "public"."_UserFavorites" FOR INSERT 
TO authenticated
WITH CHECK ("A" = auth.uid()::text);

-- 4. Silme Politikası: Kullanıcılar kendi favorilerini silebilir
CREATE POLICY "Kullanıcılar kendi favorilerini silebilir" 
ON "public"."_UserFavorites" FOR DELETE
TO authenticated
USING ("A" = auth.uid()::text);

-- 5. Silme Politikası: Admin tüm favori kayıtlarını silebilir
CREATE POLICY "Admin tüm favori kayıtlarını silebilir" 
ON "public"."_UserFavorites" FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'role' = 'ADMIN'); 