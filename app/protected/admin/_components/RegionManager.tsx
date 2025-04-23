"use client";

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Trash2, 
  Search, 
  Eye,
  Home,
  Edit,
} from 'lucide-react';
import { regionApi } from '@/utils/api-client';
import type { Region } from '@/app/api/regions/utils';
import type { ApiError } from '@/utils/api-client';

// Textarea bileşeni
const Textarea = ({ className, ...props }: React.ComponentProps<"textarea">) => {
  return (
    <textarea
      className={`border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ${className}`}
      {...props}
    />
  );
};

// Form için Zod şeması
const regionSchema = z.object({
  name: z.string().min(2, { message: "Bölge adı en az 2 karakter olmalıdır" }),
  isMainRegion: z.boolean().default(false),
  parentId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isPromoted: z.boolean().default(false),
  slug: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  metaTitle: z.string().optional().nullable(),
  metaDesc: z.string().optional().nullable(),
});

type RegionFormValues = z.infer<typeof regionSchema>;

// Bölge ekleme formu
const AddRegionForm = () => {
  const queryClient = useQueryClient();
  
  // Ana bölgeleri getirme sorgusu
  const { data: parentRegionsData, isLoading: isLoadingParentRegions } = useQuery({
    queryKey: ['regions', { isMainRegion: true }],
    queryFn: () => regionApi.getMainRegions(true)
  });
  
  // Bölge ekleme mutasyonu
  const addRegionMutation = useMutation({
    mutationFn: (values: RegionFormValues) => regionApi.createRegion(values),
    onSuccess: () => {
      toast.success('Bölge başarıyla eklendi');
      // Bölgeler listesini yenile
      queryClient.invalidateQueries({ queryKey: ['regions'] });
      reset(); // Formu sıfırla
    },
    onError: (error: Error | ApiError) => {
      toast.error(`Bölge eklenirken hata oluştu: ${error instanceof Error ? error.message : error.message || 'Bilinmeyen hata'}`);
      console.error('Bölge ekleme hatası:', error);
    }
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(regionSchema),
    defaultValues: {
      name: '',
      isMainRegion: false,
      parentId: null,
      description: '',
      imageUrl: '',
      isPromoted: false,
      slug: '',
      isActive: true,
      metaTitle: '',
      metaDesc: '',
    }
  });

  const isMainRegion = watch('isMainRegion');

  const onSubmit = handleSubmit((values) => {
    // Eğer ana bölge ise parentId null olmalı
    if (values.isMainRegion) {
      values.parentId = null;
    }
    
    // Slug oluştur (eğer girilmediyse)
    if (!values.slug && values.name) {
      values.slug = values.name
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    // API'ye gönder
    addRegionMutation.mutate(values as RegionFormValues);
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Yeni Bölge Ekle</CardTitle>
        <CardDescription>
          Sistemde yeni bir bölge oluşturun. Ana bölge veya alt bölge olarak ekleyebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Bölge Adı <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Örn: Antalya"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">SEO URL (Slug)</Label>
                <Input
                  id="slug"
                  {...register('slug')}
                  placeholder="Örn: antalya (Boş bırakırsanız otomatik oluşturulur)"
                />
                {errors.slug && (
                  <p className="text-sm text-red-500">{errors.slug.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isMainRegion"
                checked={isMainRegion}
                onCheckedChange={(checked) => setValue('isMainRegion', checked)}
              />
              <Label htmlFor="isMainRegion">Ana Bölge</Label>
            </div>
            
            {!isMainRegion && (
              <div className="space-y-2">
                <Label htmlFor="parentId">Bağlı Olduğu Ana Bölge</Label>
                <Select 
                  onValueChange={(value) => setValue('parentId', value)}
                  defaultValue={watch('parentId') || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ana bölge seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingParentRegions ? (
                      <SelectItem value="loading" disabled>Yükleniyor...</SelectItem>
                    ) : (
                      parentRegionsData?.data?.map((region: Region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Bölge hakkında kısa açıklama"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Görsel URL</Label>
              <Input
                id="imageUrl"
                {...register('imageUrl')}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Başlık</Label>
                <Input
                  id="metaTitle"
                  {...register('metaTitle')}
                  placeholder="SEO Meta Başlık"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metaDesc">Meta Açıklama</Label>
                <Input
                  id="metaDesc"
                  {...register('metaDesc')}
                  placeholder="SEO Meta Açıklama"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPromoted"
                  checked={watch('isPromoted')}
                  onCheckedChange={(checked) => setValue('isPromoted', checked)}
                />
                <Label htmlFor="isPromoted">Öne Çıkan</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={addRegionMutation.isPending}>
            {addRegionMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ekleniyor...
              </>
            ) : (
              'Bölge Ekle'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Bölge listesi bileşeni
const RegionsList = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'main' | 'sub'>('all');
  const [showInactive, setShowInactive] = useState(false);

  // Bölgeleri getirme sorgusu
  const {
    data: regionsData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['regions', { search: searchTerm, type: filterType, inactive: showInactive }],
    queryFn: () => {
      const filters: Record<string, boolean | string> = {};
      
      if (filterType === 'main') {
        filters.isMainRegion = true;
      } else if (filterType === 'sub') {
        filters.isMainRegion = false;
      }
      
      if (!showInactive) {
        filters.isActive = true;
      }
      
      return regionApi.getRegions(filters);
    }
  });

  // Bölge güncelleme mutasyonu
  const updateRegionStatusMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Region> }) => 
      regionApi.updateRegion(id, updates),
    onSuccess: () => {
      toast.success('Bölge durumu başarıyla güncellendi');
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
    onError: (error: Error | ApiError) => {
      toast.error(`Bölge güncellenirken hata: ${error instanceof Error ? error.message : error.message || 'Bilinmeyen hata'}`);
    }
  });

  // Bölge silme mutasyonu
  const deleteRegionMutation = useMutation({
    mutationFn: (id: string) => regionApi.deleteRegion(id),
    onSuccess: () => {
      toast.success('Bölge başarıyla silindi');
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
    onError: (error: Error | ApiError) => {
      toast.error(`Bölge silinirken hata: ${error instanceof Error ? error.message : error.message || 'Bilinmeyen hata'}`);
    }
  });

  const handleToggleActive = (region: Region) => {
    updateRegionStatusMutation.mutate({
      id: region.id,
      updates: { isActive: !region.isActive }
    });
  };

  const handleTogglePromoted = (region: Region) => {
    updateRegionStatusMutation.mutate({
      id: region.id,
      updates: { isPromoted: !region.isPromoted }
    });
  };

  const handleDeleteRegion = (region: Region) => {
    if (window.confirm(`"${region.name}" bölgesini silmek istediğinizden emin misiniz?`)) {
      deleteRegionMutation.mutate(region.id);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bölgeleri Yönet</CardTitle>
        <CardDescription>
          Sistemdeki bölgeleri görüntüleyin, düzenleyin veya silin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtreler */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Bölge ara..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select
              value={filterType}
              onValueChange={(value: 'all' | 'main' | 'sub') => setFilterType(value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Bölgeler</SelectItem>
                <SelectItem value="main">Ana Bölgeler</SelectItem>
                <SelectItem value="sub">Alt Bölgeler</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center">
              <Switch
                id="showInactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="showInactive" className="ml-2">Pasif Bölgeler</Label>
            </div>
          </div>
        </div>
        
        {/* Bölgeler listesi */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-red-500">
            Bölgeler yüklenirken bir hata oluştu: {error instanceof Error ? error.message : 'Bilinmeyen hata'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bölge Adı</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!regionsData?.data || regionsData.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    {filterType !== 'all' || searchTerm 
                      ? 'Filtrelere uygun bölge bulunamadı.' 
                      : 'Henüz bölge eklenmemiş.'}
                  </TableCell>
                </TableRow>
              ) : (
                regionsData.data.map((region: Region) => (
                  <TableRow key={region.id} className={!region.isActive ? "opacity-60" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        {region.isMainRegion && <Home className="h-3 w-3 text-blue-500" />}
                        {region.isPromoted && <span className="text-yellow-500 text-xs font-bold mr-1">★</span>}
                        {region.name}
                      </div>
                    </TableCell>
                    <TableCell>{region.isMainRegion ? 'Ana Bölge' : 'Alt Bölge'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${region.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {region.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </TableCell>
                    <TableCell>{region.slug}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleTogglePromoted(region)}
                          title={region.isPromoted ? "Öne çıkarmayı kaldır" : "Öne çıkar"}
                        >
                          <span className={`text-lg ${region.isPromoted ? "text-yellow-500" : "text-gray-400"}`}>★</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(region)}
                          className="h-8 w-8"
                          title={region.isActive ? "Deaktif et" : "Aktif et"}
                        >
                          <Eye className={`h-4 w-4 ${region.isActive ? "text-green-500" : "text-red-500"}`} />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRegion(region)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

// Ana RegionManager bileşeni
const RegionManager = () => {
  return (
    <Tabs defaultValue="list" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="list">Bölgeler</TabsTrigger>
        <TabsTrigger value="add">Yeni Bölge Ekle</TabsTrigger>
      </TabsList>
      <TabsContent value="list">
        <RegionsList />
      </TabsContent>
      <TabsContent value="add">
        <AddRegionForm />
      </TabsContent>
    </Tabs>
  );
};

export default RegionManager; 