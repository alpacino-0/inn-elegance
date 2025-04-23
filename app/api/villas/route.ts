import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { CreateVillaDto } from '@/types/villa';

// GET - Villaları listele (filtreler ve sayfalama ile)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filtre parametrelerini al
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const status = searchParams.get('status') || 'ACTIVE';
    const regionId = searchParams.get('regionId') || null;
    const subRegionId = searchParams.get('subRegionId') || null;
    const managerId = searchParams.get('managerId') || null;
    const minBedrooms = searchParams.get('minBedrooms') ? Number.parseInt(searchParams.get('minBedrooms') as string, 10) : null;
    const minBathrooms = searchParams.get('minBathrooms') ? Number.parseInt(searchParams.get('minBathrooms') as string, 10) : null;
    const minGuests = searchParams.get('minGuests') ? Number.parseInt(searchParams.get('minGuests') as string, 10) : null;
    const promoted = searchParams.get('promoted') === 'true';
    const searchQuery = searchParams.get('search') || null;
    const tags = searchParams.getAll('tags[]');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Sayfalama hesapla
    const offset = (page - 1) * limit;
    
    const supabase = await createClient();
    let query = supabase
      .from('Villa')
      .select('*, User!managerId(id, name, email)', { count: 'exact' });
    
    // Filtreleri uygula
    if (status !== 'ALL') {
      query = query.eq('status', status);
    }
    
    if (regionId) {
      query = query.eq('regionId', regionId);
    }
    
    if (subRegionId) {
      query = query.eq('subRegionId', subRegionId);
    }
    
    if (managerId) {
      query = query.eq('managerId', managerId);
    }
    
    if (minBedrooms) {
      query = query.gte('bedrooms', minBedrooms);
    }
    
    if (minBathrooms) {
      query = query.gte('bathrooms', minBathrooms);
    }
    
    if (minGuests) {
      query = query.gte('maxGuests', minGuests);
    }
    
    if (promoted) {
      query = query.eq('isPromoted', true);
    }
    
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    
    if (tags.length > 0) {
      query = query.overlaps('tags', tags);
    }
    
    // Sıralama
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Sayfalama
    const { data, error, count } = await query
      .range(offset, offset + limit - 1);
    
    if (error) {
      return NextResponse.json(
        { error: 'Villalar alınırken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }
    
    // Kullanıcıları uygun formatta döndür
    return NextResponse.json({
      items: data || [],
      totalCount: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('Villalar listesi API hatası:', error);
    return NextResponse.json(
      { error: 'Villalar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Yeni villa oluştur
export async function POST(request: NextRequest) {
  try {
    const villaData: CreateVillaDto = await request.json();
    
    // Gerekli alanları kontrol et
    if (!villaData.title || !villaData.description || !villaData.slug || 
        !villaData.regionId || !villaData.subRegionId || 
        !villaData.bedrooms || !villaData.bathrooms || !villaData.maxGuests) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Slug'ın benzersiz olduğunu kontrol et
    const { data: existingVilla, error: slugCheckError } = await supabase
      .from('Villa')
      .select('id')
      .eq('slug', villaData.slug)
      .maybeSingle();
    
    if (slugCheckError) {
      return NextResponse.json(
        { error: 'Slug kontrolü sırasında bir hata oluştu', details: slugCheckError.message },
        { status: 500 }
      );
    }
    
    if (existingVilla) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor' },
        { status: 400 }
      );
    }
    
    // Bölge ve alt bölge kontrolleri
    const { data: region, error: regionError } = await supabase
      .from('Region')
      .select('id, name')
      .eq('id', villaData.regionId)
      .single();
    
    if (regionError || !region) {
      return NextResponse.json(
        { error: 'Belirtilen bölge bulunamadı' },
        { status: 400 }
      );
    }
    
    const { data: subRegion, error: subRegionError } = await supabase
      .from('Region')
      .select('id, name')
      .eq('id', villaData.subRegionId)
      .single();
    
    if (subRegionError || !subRegion) {
      return NextResponse.json(
        { error: 'Belirtilen alt bölge bulunamadı' },
        { status: 400 }
      );
    }
    
    // Yönetici kontrolü (eğer belirtilmişse)
    if (villaData.managerId) {
      const { data: manager, error: managerError } = await supabase
        .from('User')
        .select('id')
        .eq('id', villaData.managerId)
        .single();
      
      if (managerError || !manager) {
        return NextResponse.json(
          { error: 'Belirtilen yönetici bulunamadı' },
          { status: 400 }
        );
      }
    }
    
    // Bölge ve alt bölge isimlerini ekle
    const newVillaData = {
      ...villaData,
      mainRegion: region.name,
      subRegion: subRegion.name,
      // Dizileri kontrol et ve varsayılan değerler ata
      rules: villaData.rules || [],
      houseRules: villaData.houseRules || [],
      tags: villaData.tags || []
    };
    
    // Yeni villa ekle
    const { data, error } = await supabase
      .from('Villa')
      .insert([newVillaData])
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Villa eklenirken bir hata oluştu', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Villa ekleme API hatası:', error);
    return NextResponse.json(
      { error: 'Villa eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 