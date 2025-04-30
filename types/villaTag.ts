// VillaTag tablosu için tip tanımlamaları
// Villa ve Tag arasındaki ilişkiyi temsil eder

export interface VillaTag {
  id: string; // uuid
  villaId: string; // uuid - Villa'ya referans
  tagId: string; // uuid - Tag'e referans
  createdAt: string | null; // timestamp with timezone

  // İlişkili alanlar (API yanıt verisinde bulunabilir)
  Villa?: {
    id: string;
    title: string;
    slug: string;
    // ...diğer villa alanları
  };
  
  Tag?: {
    id: string;
    name: string;
  };
}

// Yeni VillaTag oluşturmak için DTO
export interface CreateVillaTagDto {
  villaId: string;
  tagId: string;
}

// VillaTag güncellemek için DTO
export interface UpdateVillaTagDto {
  villaId?: string;
  tagId?: string;
}

// Tag ile birlikte VillaTag oluşturma için DTO
export interface CreateVillaTagWithNameDto {
  villaId: string;
  tagName: string; // Yeni tag oluştur veya mevcut tag'ı bul
}
