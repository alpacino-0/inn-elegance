-- _UserFavorites tablosu için RLS güvenlik politikaları
-- Bu script, sadece _UserFavorites tablosu için RLS etkinleştirir ve erişim politikalarını tanımlar

-- RLS'yi etkinleştir
ALTER TABLE "public"."_UserFavorites" ENABLE ROW LEVEL SECURITY;

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