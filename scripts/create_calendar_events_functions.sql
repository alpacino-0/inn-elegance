-- create_calendar_events_from_seasonal_price fonksiyonu
-- Bu fonksiyon, bir SeasonalPrice kaydı eklendiğinde veya güncellendiğinde çalışır
-- ve her gün için CalendarEvent kayıtları oluşturur
CREATE OR REPLACE FUNCTION public.create_calendar_events_from_seasonal_price()
RETURNS TRIGGER AS $$
DECLARE
    curr_date DATE;
    daily_price NUMERIC(10,2);
BEGIN
    -- Tarih aralığındaki her gün için döngü
    curr_date := DATE(NEW."startDate");
    
    WHILE curr_date <= DATE(NEW."endDate") LOOP
        -- Günlük fiyatı hesapla (haftalık fiyat varsa ona göre, yoksa doğrudan günlük fiyat)
        IF NEW."weeklyPrice" IS NOT NULL AND NEW."weeklyPrice" > 0 THEN
            daily_price := NEW."weeklyPrice" / 7;
        ELSE
            daily_price := NEW."nightlyPrice";
        END IF;
        
        -- Mevcut bir calendar event var mı kontrol et
        -- Varsa ve status AVAILABLE ise güncelle, yoksa yeni ekle
        INSERT INTO public."CalendarEvent" (
            "villaId", 
            date, 
            status, 
            price, 
            "eventType"
        )
        VALUES (
            NEW."villaId",
            (curr_date AT TIME ZONE 'UTC'),
            'AVAILABLE'::"CalendarStatus",
            daily_price,
            NULL
        )
        ON CONFLICT ("villaId", date) 
        DO UPDATE SET
            price = daily_price,
            "eventType" = NULL
        WHERE 
            "CalendarEvent".status = 'AVAILABLE'::"CalendarStatus" AND
            "CalendarEvent"."reservationId" IS NULL;
            
        -- Bir sonraki güne geç
        curr_date := curr_date + INTERVAL '1 day';
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- update_calendar_events_on_seasonal_price_delete_or_deactivate fonksiyonu
-- Bu fonksiyon, bir SeasonalPrice kaydı silindiğinde veya deaktif edildiğinde çalışır
-- ve ilgili CalendarEvent kayıtlarını günceller
CREATE OR REPLACE FUNCTION public.update_calendar_events_on_seasonal_price_delete_or_deactivate()
RETURNS TRIGGER AS $$
DECLARE
    curr_date DATE;
    has_other_active_pricing BOOLEAN;
BEGIN
    -- Silinen/deaktive edilen tarih aralığındaki her gün için döngü
    curr_date := DATE(OLD."startDate");
    
    WHILE curr_date <= DATE(OLD."endDate") LOOP
        -- Bu tarih için başka aktif fiyatlandırma var mı kontrol et
        SELECT EXISTS (
            SELECT 1 
            FROM public."SeasonalPrice" 
            WHERE 
                "villaId" = OLD."villaId" AND
                "isActive" = TRUE AND
                curr_date BETWEEN DATE("startDate") AND DATE("endDate") AND
                id != OLD.id
        ) INTO has_other_active_pricing;
        
        -- Eğer başka aktif fiyatlandırma yoksa, ilgili CalendarEvent'i güncelle veya sil
        IF NOT has_other_active_pricing THEN
            -- Rezervasyon var mı kontrol et
            UPDATE public."CalendarEvent"
            SET 
                price = NULL,  -- Fiyat bilgisini NULL yap
                "eventType" = NULL  -- EventType NULL olarak güncelle
            WHERE 
                "villaId" = OLD."villaId" AND
                DATE(date) = curr_date AND
                status = 'AVAILABLE'::"CalendarStatus" AND
                "reservationId" IS NULL;
        END IF;
            
        -- Bir sonraki güne geç
        curr_date := curr_date + INTERVAL '1 day';
    END LOOP;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 