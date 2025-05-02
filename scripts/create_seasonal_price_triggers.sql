-- SeasonalPrice tablosu için trigger'lar

-- Yeni sezonsal fiyat eklendiğinde veya güncellendiğinde calendar event oluştur
CREATE OR REPLACE TRIGGER create_calendar_events_after_seasonal_price_insert_or_update
AFTER INSERT OR UPDATE ON public."SeasonalPrice" 
FOR EACH ROW 
WHEN (NEW."isActive" = TRUE)
EXECUTE FUNCTION public.create_calendar_events_from_seasonal_price();

-- Sezonsal fiyat deaktif edildiğinde calendar event güncelle
CREATE OR REPLACE TRIGGER update_calendar_events_after_seasonal_price_deactivate
AFTER UPDATE OF "isActive" ON public."SeasonalPrice" 
FOR EACH ROW 
WHEN (OLD."isActive" = TRUE AND NEW."isActive" = FALSE)
EXECUTE FUNCTION public.update_calendar_events_on_seasonal_price_delete_or_deactivate();

-- Sezonsal fiyat silindiğinde calendar event güncelle
CREATE OR REPLACE TRIGGER update_calendar_events_after_seasonal_price_delete
AFTER DELETE ON public."SeasonalPrice" 
FOR EACH ROW 
WHEN (OLD."isActive" = TRUE)
EXECUTE FUNCTION public.update_calendar_events_on_seasonal_price_delete_or_deactivate(); 