// Villa görseli temel tip tanımı
export interface VillaImage {
  id: string;
  villaId: string;
  url: string;
  alt: string | null;
  title: string | null;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
}

// Villa görseli oluşturma DTO
export interface CreateVillaImageDto {
  url: string;
  alt?: string | null;
  title?: string | null;
  isFeatured?: boolean;
  displayOrder?: number;
}

// Villa görseli güncelleme DTO
export interface UpdateVillaImageDto {
  url?: string;
  alt?: string | null;
  title?: string | null;
  isFeatured?: boolean;
  displayOrder?: number;
} 