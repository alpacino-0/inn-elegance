export interface FilterParams {
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  regionId?: string;
  subRegionId?: string;
  tagIds?: string[];
  page?: number;
  limit?: number;
}

export interface FilterOption {
  id: string;
  name: string;
  count?: number;
}

// Region özelliklerini içeren bölge seçeneği
export interface RegionOption extends FilterOption {
  isMainRegion?: boolean;
  parentId?: string;
  description?: string;
  imageUrl?: string;
  isPromoted?: boolean;
  slug?: string;
  villaCount?: number;
  isActive?: boolean;
  metaTitle?: string;
  metaDesc?: string;
  subRegions?: FilterOption[];
}

export interface ActiveFilter {
  key: keyof FilterParams;
  label: string;
  value: string;
} 