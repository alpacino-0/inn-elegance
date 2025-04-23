import { useState } from 'react';
import Link from 'next/link';
import { useVillas } from '@/hooks/use-villa-queries';
import type { VillaFilters, VillaStatus, Villa } from '@/types/villa';

// UI Bileşenleri
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';

const DEFAULT_FILTERS: VillaFilters = {
  status: 'ACTIVE',
  page: 1,
  limit: 10,
  sortOrder: 'desc',
  sortBy: 'createdAt',
};

export default function VillaList() {
  const [filters, setFilters] = useState<VillaFilters>(DEFAULT_FILTERS);
  const { data, isLoading, isError, error, isFetching } = useVillas(filters);

  const villas = data?.data?.items || [];
  const totalCount = data?.data?.totalCount || 0;
  const totalPages = data?.data?.totalPages || 0;

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleFilterChange = (newFilters: Partial<VillaFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Filtreleri değiştirdiğimizde ilk sayfaya dönüyoruz
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    switch (name) {
      case 'status':
        handleFilterChange({ status: value === 'ALL' ? undefined : value as VillaStatus });
        break;
      case 'promoted': {
        handleFilterChange({ 
          promoted: value === 'all' ? undefined : value === 'true' 
        });
        break;
      }
      case 'sort': {
        const [sortBy, sortOrder] = value.split('_');
        handleFilterChange({ 
          sortBy: sortBy as keyof Villa, 
          sortOrder: sortOrder as 'asc' | 'desc' 
        });
        break;
      }
      case 'limit':
        handleFilterChange({ limit: Number(value) });
        break;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Villalar yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-destructive">Hata: {error?.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <CardTitle className="font-montserrat text-primary">
          Villalar ({totalCount})
        </CardTitle>
        <Button asChild variant="default">
          <Link href="/protected/admin/villas/new">
            Yeni Villa Ekle
          </Link>
        </Button>
      </div>

      {isFetching && (
        <div className="text-sm text-muted-foreground">Veriler güncelleniyor...</div>
      )}

      {/* Filtre UI */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-montserrat text-primary">Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Durum</Label>
              <Select 
                value={filters.status || 'ALL'} 
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger id="status-filter" className="w-full">
                  <SelectValue placeholder="Durum Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="INACTIVE">Pasif</SelectItem>
                  <SelectItem value="PENDING">Beklemede</SelectItem>
                  <SelectItem value="DELETED">Silinmiş</SelectItem>
                  <SelectItem value="ALL">Tümü</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promoted-filter">Öne Çıkan</Label>
              <Select 
                value={filters.promoted === undefined ? 'all' : String(filters.promoted)}
                onValueChange={(value) => handleSelectChange('promoted', value)}
              >
                <SelectTrigger id="promoted-filter" className="w-full">
                  <SelectValue placeholder="Öne Çıkan Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="true">Evet</SelectItem>
                  <SelectItem value="false">Hayır</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort-filter">Sıralama</Label>
              <Select 
                value={`${filters.sortBy}_${filters.sortOrder}`}
                onValueChange={(value) => handleSelectChange('sort', value)}
              >
                <SelectTrigger id="sort-filter" className="w-full">
                  <SelectValue placeholder="Sıralama Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt_desc">Oluşturma Tarihi (Yeni → Eski)</SelectItem>
                  <SelectItem value="createdAt_asc">Oluşturma Tarihi (Eski → Yeni)</SelectItem>
                  <SelectItem value="title_asc">İsim (A → Z)</SelectItem>
                  <SelectItem value="title_desc">İsim (Z → A)</SelectItem>
                  <SelectItem value="bedrooms_desc">Yatak Odası (Fazla → Az)</SelectItem>
                  <SelectItem value="bedrooms_asc">Yatak Odası (Az → Fazla)</SelectItem>
                  <SelectItem value="maxGuests_desc">Misafir Kapasitesi (Fazla → Az)</SelectItem>
                  <SelectItem value="maxGuests_asc">Misafir Kapasitesi (Az → Fazla)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit-filter">Sayfa Başına</Label>
              <Select 
                value={String(filters.limit)}
                onValueChange={(value) => handleSelectChange('limit', value)}
              >
                <SelectTrigger id="limit-filter" className="w-full">
                  <SelectValue placeholder="Gösterim Sayısı" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Villa listesi */}
      <Card>
        <CardContent className="p-0">
          {villas.length === 0 ? (
            <div className="text-center p-10">
              <p className="text-muted-foreground">Uygun villa bulunamadı</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Villa</TableHead>
                  <TableHead>Bölge</TableHead>
                  <TableHead>Kapasite</TableHead>
                  <TableHead>Min. Konaklama</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {villas.map((villa) => (
                  <TableRow key={villa.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <Link
                          href={`/protected/admin/villas/${villa.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {villa.title}
                        </Link>
                        <span className="text-xs text-muted-foreground">{villa.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground">{villa.mainRegion}</div>
                      <div className="text-xs text-muted-foreground">{villa.subRegion}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-foreground">
                        {villa.maxGuests} Misafir
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {villa.bedrooms} YO, {villa.bathrooms} Banyo
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {villa.minimumStay} Gece
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge 
                          variant={
                            villa.status === 'ACTIVE' 
                              ? 'default' 
                              : villa.status === 'INACTIVE' 
                              ? 'secondary' 
                              : villa.status === 'PENDING' 
                              ? 'outline' 
                              : 'destructive'
                          }
                        >
                          {villa.status === 'ACTIVE' 
                            ? 'Aktif' 
                            : villa.status === 'INACTIVE' 
                            ? 'Pasif' 
                            : villa.status === 'PENDING' 
                            ? 'Beklemede' 
                            : 'Silinmiş'}
                        </Badge>
                        {villa.isPromoted && (
                          <Badge variant="secondary">Öne Çıkan</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/protected/admin/villas/${villa.id}`}>
                            Detay
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="default">
                          <Link href={`/protected/admin/villas/${villa.id}/edit`}>
                            Düzenle
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={filters.page === 1}
          >
            İlk
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(filters.page ? filters.page - 1 : 1)}
            disabled={filters.page === 1}
          >
            Önceki
          </Button>
          
          <span className="mx-2">
            Sayfa {filters.page} / {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(filters.page ? filters.page + 1 : 1)}
            disabled={filters.page === totalPages}
          >
            Sonraki
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={filters.page === totalPages}
          >
            Son
          </Button>
        </div>
      )}
    </div>
  );
} 