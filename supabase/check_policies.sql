-- Mevcut RLS politikalarını kontrol et
-- Bu sorgu, hangi tabloların RLS'ye sahip olduğunu ve hangi politikaların mevcut olduğunu gösterir

-- Hangi tablolarda RLS etkin?
SELECT 
    tablename,
    rowsecurity
FROM 
    pg_tables 
WHERE 
    schemaname = 'public'
ORDER BY 
    tablename;

-- Mevcut politikaları listele
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual::text,
    with_check::text
FROM 
    pg_policies
WHERE 
    schemaname = 'public'
ORDER BY 
    tablename, 
    policyname; 