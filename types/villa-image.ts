// Villa görseli temel tip tanımı
export interface VillaImage {
  id: string;
  villaId: string;
  imageUrl: string;
  title: string | null;
  altText: string | null;
  order: number;
  isCoverImage: boolean;
  createdAt: string;
}

// Villa görseli oluşturma DTO
export interface CreateVillaImageDto {
  villaId?: string;
  imageUrl: string;
  title?: string | null;
  altText?: string | null;
  order?: number;
  isCoverImage?: boolean;
}

// Villa görseli güncelleme DTO
export interface UpdateVillaImageDto {
  imageUrl?: string;
  title?: string | null;
  altText?: string | null;
  order?: number;
  isCoverImage?: boolean;
} 