// SeasonalPrice tablosu için tip tanımlamaları
export interface SeasonalPrice {
  id: string; // uuid
  villaId: string; // uuid
  seasonName: string;
  startDate: string; // timestamp with timezone
  endDate: string; // timestamp with timezone
  nightlyPrice: number;
  weeklyPrice: number | null;
  currencyId: string; // uuid
  description: string | null;
  isActive: boolean;
  createdAt: string; // timestamp with timezone
  updatedAt: string; // timestamp with timezone
  // İlişkili alanlar (API yanıt verisinde bulunabilir)
  currency?: {
    id: string;
    code: string;
    name: string;
    symbol: string;
  };
}

// Yeni sezon fiyatı oluşturmak için DTO
export interface CreateSeasonalPriceDto {
  seasonName: string;
  startDate: string; // ISO 8601 formatında tarih (YYYY-MM-DD)
  endDate: string; // ISO 8601 formatında tarih (YYYY-MM-DD)
  nightlyPrice: number;
  weeklyPrice?: number | null;
  currencyId: string;
  description?: string | null;
  isActive?: boolean;
}

// Sezon fiyatı güncellemek için DTO
export interface UpdateSeasonalPriceDto {
  seasonName?: string;
  startDate?: string;
  endDate?: string;
  nightlyPrice?: number;
  weeklyPrice?: number | null;
  currencyId?: string;
  description?: string | null;
  isActive?: boolean;
}

// Sezon fiyatı filtresi (API sorguları için)
export interface SeasonalPriceFilters {
  isActive?: boolean;
  startDateAfter?: string;
  endDateBefore?: string;
  currencyId?: string;
} 