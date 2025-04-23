// Villa tablolarıyla ilgili tipler

export type VillaStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'DELETED';

export interface Villa {
  id: string; // uuid
  title: string;
  description: string;
  slug: string;
  mainRegion: string;
  subRegion: string;
  regionId: string; // uuid
  subRegionId: string; // uuid
  deposit: number;
  cleaningFee: number | null;
  shortStayDayLimit: number | null;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  checkInTime: string;
  checkOutTime: string;
  minimumStay: number;
  rules: string[];
  tags: string[];
  embedCode: string | null;
  status: VillaStatus;
  isPromoted: boolean;
  createdAt: string; // timestamp with timezone
  updatedAt: string; // timestamp with timezone
  advancePaymentRate: number;
  checkInNotes: string | null;
  checkOutNotes: string | null;
  houseRules: string[];
  cancellationNotes: string | null;
  managerId: string | null; // uuid
  translations: Record<string, unknown> | null;
}

// Villa listesi için filtreleme parametreleri
export interface VillaFilters {
  page?: number;
  limit?: number;
  status?: VillaStatus | 'ALL';
  regionId?: string;
  subRegionId?: string;
  managerId?: string;
  minBedrooms?: number;
  minBathrooms?: number;
  minGuests?: number;
  promoted?: boolean;
  search?: string;
  tags?: string[];
  sortBy?: keyof Villa;
  sortOrder?: 'asc' | 'desc';
}

// Sayfalama sonucu
export interface PaginatedVillas {
  items: Villa[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Villa oluşturma için gerekli alanlar
export interface CreateVillaDto {
  title: string;
  description: string;
  slug: string;
  regionId: string;
  subRegionId: string;
  deposit: number;
  cleaningFee?: number | null;
  shortStayDayLimit?: number | null;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  checkInTime?: string;
  checkOutTime?: string;
  minimumStay?: number;
  rules?: string[];
  tags?: string[];
  embedCode?: string | null;
  status?: VillaStatus;
  isPromoted?: boolean;
  advancePaymentRate?: number;
  checkInNotes?: string | null;
  checkOutNotes?: string | null;
  houseRules?: string[];
  cancellationNotes?: string | null;
  managerId?: string | null;
  translations?: Record<string, unknown> | null;
}

// Villa güncelleme için gerekli alanlar
export interface UpdateVillaDto {
  title?: string;
  description?: string;
  slug?: string;
  mainRegion?: string;
  subRegion?: string;
  regionId?: string;
  subRegionId?: string;
  deposit?: number;
  cleaningFee?: number | null;
  shortStayDayLimit?: number | null;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  checkInTime?: string;
  checkOutTime?: string;
  minimumStay?: number;
  rules?: string[];
  tags?: string[];
  embedCode?: string | null;
  status?: VillaStatus;
  isPromoted?: boolean;
  advancePaymentRate?: number;
  checkInNotes?: string | null;
  checkOutNotes?: string | null;
  houseRules?: string[];
  cancellationNotes?: string | null;
  managerId?: string | null;
  translations?: Record<string, unknown> | null;
} 