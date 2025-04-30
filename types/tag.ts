// Tag (Etiket) tablosu için tip tanımlamaları

export interface Tag {
  id: string; // uuid
  name: string; // Etiket adı
  createdAt: string | null; // timestamp with timezone

  // İlişkili alanlar (API yanıt verisinde bulunabilir)
  VillaTags?: Array<{
    id: string;
    villaId: string;
    Villa?: {
      id: string;
      title: string;
      slug: string;
      // ...diğer villa alanları
    };
  }>;
}

// Yeni Tag oluşturmak için DTO
export interface CreateTagDto {
  name: string;
}

// Tag güncellemek için DTO
export interface UpdateTagDto {
  name?: string;
}

// Etiket filtreleme için kullanılabilecek parametreler
export interface TagFilters {
  search?: string; // Etiket adına göre arama
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
