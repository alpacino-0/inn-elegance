-- Mevcut tüm aktif sezonsal fiyatları calendar event tablosuna aktar
DO $$
DECLARE
    seasonal_price RECORD;
    curr_date DATE;
    daily_price NUMERIC(10,2);
BEGIN
    -- Tüm aktif sezonsal fiyatlar için döngü
    FOR seasonal_price IN SELECT * FROM public."SeasonalPrice" WHERE "isActive" = TRUE LOOP
        -- Her tarih aralığı için döngü
        curr_date := DATE(seasonal_price."startDate");
        
        WHILE curr_date <= DATE(seasonal_price."endDate") LOOP
            -- Günlük fiyatı hesapla
            IF seasonal_price."weeklyPrice" IS NOT NULL AND seasonal_price."weeklyPrice" > 0 THEN
                daily_price := seasonal_price."weeklyPrice" / 7;
            ELSE
                daily_price := seasonal_price."nightlyPrice";
            END IF;
            
            -- CalendarEvent tablosuna ekle veya güncelle
            INSERT INTO public."CalendarEvent" (
                "villaId", 
                date, 
                status, 
                price, 
                "eventType"
            )
            VALUES (
                seasonal_price."villaId",
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
    END LOOP;
END $$; 