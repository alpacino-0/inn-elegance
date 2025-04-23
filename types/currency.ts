export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isDefault: boolean;
  isActive: boolean;
  autoUpdate: boolean;
  updateInterval: number; // dakika cinsinden
  lastUpdated?: string; // ISO tarih formatı
  lastUpdateStatus?: 'success' | 'error' | 'pending';
  createdAt: string; // ISO tarih formatı
  updatedAt: string; // ISO tarih formatı
}

export interface CreateCurrencyDto {
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isDefault: boolean;
  isActive: boolean;
  autoUpdate: boolean;
  updateInterval: number;
}

export interface UpdateCurrencyDto {
  name?: string;
  symbol?: string;
  exchangeRate?: number;
  isDefault?: boolean;
  isActive?: boolean;
  autoUpdate?: boolean;
  updateInterval?: number;
  lastUpdateStatus?: 'success' | 'error' | 'pending';
}

export interface CurrencyFilters {
  isActive?: boolean;
  isDefault?: boolean;
  autoUpdate?: boolean;
  search?: string; // code veya name üzerinde arama yapmak için
} 