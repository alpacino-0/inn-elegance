"use client";

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { villaAmenityApi } from '@/utils/api-client';
import type { VillaAmenity } from '@/app/api/villa-amenities/utils';
import type { ApiError } from '@/utils/api-client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Loader2, Pencil, Trash2, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Önceden tanımlanmış olanaklar
const DEFAULT_AMENITIES = [
  // Temel Konfor ve Eğlence
  { id: 'wifi', name: 'Wi-Fi İnternet Bağlantısı', icon: 'fa-wifi' }, 
  { id: 'ac', name: 'Klima', icon: 'fa-snowflake' },
  { id: 'heating', name: 'Isıtma Sistemi', icon: 'fa-temperature-high' }, 
  { id: 'smarttv', name: 'Smart TV', icon: 'fa-tv' },
  { id: 'fireplace', name: 'Şömine', icon: 'fa-fire' }, 

  // Dış Mekan ve Havuz
  { id: 'private_pool', name: 'Özel Yüzme Havuzu', icon: 'fa-swimming-pool' }, 
  { id: 'sheltered_pool', name: 'Korunaklı Havuz Alanı', icon: 'fa-umbrella-beach' }, 
  { id: 'jacuzzi', name: 'Jakuzi', icon: 'fa-hot-tub' },
  { id: 'sauna', name: 'Sauna', icon: 'fa-hot-tub-person' },
  { id: 'bbq', name: 'Barbekü (Mangal)', icon: 'fa-utensils' },
  { id: 'patio_veranda', name: 'Veranda / Teras', icon: 'fa-umbrella' }, 
  { id: 'garden', name: 'Özel Bahçe', icon: 'fa-tree' }, 
  { id: 'garden_furniture', name: 'Bahçe Mobilyası', icon: 'fa-chair' }, 
  { id: 'sun_lounger', name: 'Şezlong', icon: 'fa-couch' }, 
  { id: 'parking', name: 'Özel Otopark', icon: 'fa-car' }, 
  { id: 'view', name: 'Manzaralı', icon: 'fa-mountain-sun' }, 

  // Mutfak Donanımı
  { id: 'furnished', name: 'Tam Eşyalı', icon: 'fa-couch' }, 
  { id: 'fridge', name: 'Buzdolabı', icon: 'fa-refrigerator' },
  { id: 'dishwasher', name: 'Bulaşık Makinesi', icon: 'fa-sink' },
  { id: 'oven', name: 'Fırın (Ankastre)', icon: 'fa-oven' }, 
  { id: 'cooking_stove', name: 'Ocak (Ankastre)', icon: 'fa-fire' }, 
  { id: 'microwave', name: 'Mikrodalga Fırın', icon: 'fa-microwave' },
  { id: 'kettle', name: 'Su Isıtıcısı (Kettle)', icon: 'fa-mug-hot' }, 
  { id: 'coffee_machine', name: 'Kahve Makinesi', icon: 'fa-mug-saucer' }, 
  { id: 'cooking_ware', name: 'Tencere ve Tava Takımı', icon: 'fa-kitchen-set' }, 
  { id: 'dining_ware', name: 'Yemek Takımı', icon: 'fa-utensils' }, 
  { id: 'cutlery', name: 'Çatal Bıçak Takımı', icon: 'fa-utensils' }, 
  { id: 'glassware', name: 'Bardak Takımı', icon: 'fa-wine-glass' },

  // Banyo ve Yatak Odası
  { id: 'washing_machine', name: 'Çamaşır Makinesi', icon: 'fa-washing-machine' }, 
  { id: 'iron', name: 'Ütü ve Ütü Masası', icon: 'fa-iron' },
  { id: 'hairdryer', name: 'Saç Kurutma Makinesi', icon: 'fa-wind' },
  { id: 'towels_linens', name: 'Havlu ve Nevresim Takımı', icon: 'fa-bed' }, 

  // Bebek ve Çocuk
  { id: 'highchair', name: 'Mama Sandalyesi', icon: 'fa-baby' },
  { id: 'baby_cot', name: 'Bebek Yatağı', icon: 'fa-baby' } 
];

interface VillaAmenityManagerProps {
  villaId: string;
  villaName?: string;
}

const VillaAmenitiesManager = ({ villaId, villaName }: VillaAmenityManagerProps) => {
  const queryClient = useQueryClient();
  const [newAmenityName, setNewAmenityName] = useState('');
  const [newAmenityIcon, setNewAmenityIcon] = useState('');
  const [editingAmenity, setEditingAmenity] = useState<{ id: string; name: string; icon: string | null } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("existing");
  const [searchTerm, setSearchTerm] = useState('');

  // Villa olanaklarını getirme sorgusu
  const {
    data: amenitiesData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['villaAmenities', villaId],
    queryFn: () => villaAmenityApi.getVillaAmenities(villaId),
    enabled: !!villaId,
  });

  // Yeni olanak ekleme mutasyonu
  const addAmenityMutation = useMutation({
    mutationFn: (data: { name: string; icon: string | null }) => 
      villaAmenityApi.addAmenity(villaId, data),
    onSuccess: () => {
      toast.success('Olanak başarıyla eklendi');
      queryClient.invalidateQueries({ queryKey: ['villaAmenities', villaId] });
      setNewAmenityName('');
      setNewAmenityIcon('');
    },
    onError: (error: Error | ApiError) => {
      toast.error(`Olanak eklenirken hata: ${error instanceof Error ? error.message : error.message || 'Bilinmeyen hata'}`);
    }
  });

  // Olanak güncelleme mutasyonu
  const updateAmenityMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { name?: string; icon?: string | null } }) => 
      villaAmenityApi.updateAmenity(id, updates),
    onSuccess: () => {
      toast.success('Olanak başarıyla güncellendi');
      queryClient.invalidateQueries({ queryKey: ['villaAmenities', villaId] });
      setEditingAmenity(null);
    },
    onError: (error: Error | ApiError) => {
      toast.error(`Olanak güncellenirken hata: ${error instanceof Error ? error.message : error.message || 'Bilinmeyen hata'}`);
    }
  });

  // Olanak silme mutasyonu
  const deleteAmenityMutation = useMutation({
    mutationFn: (id: string) => villaAmenityApi.deleteAmenity(id),
    onSuccess: () => {
      toast.success('Olanak başarıyla silindi');
      queryClient.invalidateQueries({ queryKey: ['villaAmenities', villaId] });
    },
    onError: (error: Error | ApiError) => {
      toast.error(`Olanak silinirken hata: ${error instanceof Error ? error.message : error.message || 'Bilinmeyen hata'}`);
    }
  });

  const handleAddAmenity = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!newAmenityName.trim()) return;
    
    addAmenityMutation.mutate({
      name: newAmenityName,
      icon: newAmenityIcon.trim() || null
    });
  };

  const handleAddDefaultAmenity = (amenity: { name: string; icon: string | null }) => {
    addAmenityMutation.mutate({
      name: amenity.name,
      icon: amenity.icon
    });
  };

  const handleUpdateAmenity = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!editingAmenity || !editingAmenity.name.trim()) return;
    
    updateAmenityMutation.mutate({
      id: editingAmenity.id,
      updates: {
        name: editingAmenity.name,
        icon: editingAmenity.icon
      }
    });
  };

  const handleDeleteAmenity = (amenity: VillaAmenity) => {
    if (window.confirm(`"${amenity.name}" olanağını silmek istediğinizden emin misiniz?`)) {
      deleteAmenityMutation.mutate(amenity.id);
    }
  };

  // Mevcut olanak adlarını kontrol et (eklenenlerle çakışma olmasın)
  const existingAmenityNames = amenitiesData?.data
    ? new Set(amenitiesData.data.map((a: VillaAmenity) => a.name.toLowerCase()))
    : new Set<string>();

  // Arama terimine göre olanakları filtrele
  const filteredAmenities = searchTerm.trim() 
    ? DEFAULT_AMENITIES.filter(amenity => 
        amenity.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : DEFAULT_AMENITIES;

  if (!villaId) {
    return <div className="text-center p-4">Villa ID belirtilmedi.</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Villa Olanakları {villaName && `- ${villaName}`}</CardTitle>
        <CardDescription>
          Bu villaya ait olanakları ekleyin, düzenleyin veya silin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="existing" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="existing">Mevcut Olanaklar</TabsTrigger>
            <TabsTrigger value="predefined">Hazır Olanaklar</TabsTrigger>
            <TabsTrigger value="custom">Özel Olanak Ekle</TabsTrigger>
          </TabsList>
          
          <TabsContent value="existing">
            {/* Mevcut olanaklar listesi */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-red-500">
                Olanaklar yüklenirken bir hata oluştu: {(error as Error)?.message || 'Bilinmeyen hata'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Olanak Adı</TableHead>
                    <TableHead>İkon</TableHead>
                    <TableHead className="w-[120px] text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!amenitiesData?.data || amenitiesData.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">
                        Bu villa için henüz olanak eklenmemiş.
                      </TableCell>
                    </TableRow>
                  ) : (
                    amenitiesData.data.map((amenity: VillaAmenity) => (
                      <TableRow key={amenity.id}>
                        <TableCell>
                          {editingAmenity?.id === amenity.id ? (
                            <div className="flex gap-2">
                              <Input
                                type="text"
                                value={editingAmenity.name}
                                onChange={(e) => setEditingAmenity({ ...editingAmenity, name: e.target.value })}
                                autoFocus
                                className="py-1 h-8"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleUpdateAmenity();
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            amenity.name
                          )}
                        </TableCell>
                        <TableCell>
                          {editingAmenity?.id === amenity.id ? (
                            <Input
                              type="text"
                              value={editingAmenity.icon || ''}
                              onChange={(e) => setEditingAmenity({ ...editingAmenity, icon: e.target.value || null })}
                              className="py-1 h-8"
                              placeholder="İkon (opsiyonel)"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleUpdateAmenity();
                                }
                              }}
                            />
                          ) : (
                            <div className="flex items-center">
                              {amenity.icon && <i className={`${amenity.icon} mr-2`} />}
                              <span className="text-xs text-gray-500">{amenity.icon || '-'}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          {editingAmenity?.id === amenity.id ? (
                            <>
                              <Button 
                                onClick={handleUpdateAmenity}
                                size="sm"
                                variant="outline"
                                disabled={updateAmenityMutation.isPending || !editingAmenity.name.trim()}
                              >
                                {updateAmenityMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Kaydet'}
                              </Button>
                              <Button 
                                onClick={() => setEditingAmenity(null)}
                                size="sm"
                                variant="ghost"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingAmenity({ 
                                  id: amenity.id, 
                                  name: amenity.name, 
                                  icon: amenity.icon 
                                })}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteAmenity(amenity)}
                                disabled={deleteAmenityMutation.isPending}
                              >
                                {deleteAmenityMutation.isPending && deleteAmenityMutation.variables === amenity.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                )}
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          
          <TabsContent value="predefined">
            {/* Arama kutusu */}
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Olanakları ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Hazır olanaklar listesi (kategorisiz) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAmenities.map(amenity => {
                const isAlreadyAdded = existingAmenityNames.has(amenity.name.toLowerCase());
                
                return (
                  <div key={amenity.id} className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant={isAlreadyAdded ? "ghost" : "outline"}
                      size="sm"
                      className={`w-full justify-start ${isAlreadyAdded ? 'opacity-60' : ''}`}
                      onClick={() => !isAlreadyAdded && handleAddDefaultAmenity(amenity)}
                      disabled={isAlreadyAdded || addAmenityMutation.isPending}
                    >
                      {isAlreadyAdded ? (
                        <Badge variant="outline" className="mr-2">Ekli</Badge>
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {amenity.name}
                    </Button>
                  </div>
                );
              })}
              
              {filteredAmenities.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Arama kriterine uygun olanak bulunamadı.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="custom">
            {/* Özel olanak ekleme formu */}
            <div className="mb-6">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Olanak adı..."
                  value={newAmenityName}
                  onChange={(e) => setNewAmenityName(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAmenity();
                    }
                  }}
                />
                <Input
                  type="text"
                  placeholder="İkon (opsiyonel)..."
                  value={newAmenityIcon}
                  onChange={(e) => setNewAmenityIcon(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAmenity();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  size="sm"
                  onClick={handleAddAmenity}
                  disabled={addAmenityMutation.isPending || !newAmenityName.trim()}
                >
                  {addAmenityMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" /> 
                      Ekle
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VillaAmenitiesManager; 