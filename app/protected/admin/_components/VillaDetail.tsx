import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useVillaById, useDeleteVilla, useDeactivateVilla } from '@/hooks/use-villa-queries';
import type { VillaStatus } from '@/types/villa';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VillaDetailProps {
  villaId: string;
}

export default function VillaDetail({ villaId }: VillaDetailProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'hard' | 'soft'>('soft');
  
  const { 
    data: villaData, 
    isLoading, 
    isError, 
    error 
  } = useVillaById(villaId);
  
  const deleteVillaMutation = useDeleteVilla();
  const deactivateVillaMutation = useDeactivateVilla();
  
  const villa = villaData?.data;
  
  // Silme/deaktif etme işlemleri
  const handleDelete = () => {
    if (deleteMode === 'hard') {
      deleteVillaMutation.mutate(villaId);
    } else {
      deactivateVillaMutation.mutate(villaId);
    }
    setShowDeleteModal(false);
    
    setTimeout(() => {
      router.push('/protected/admin/villas');
    }, 1000);
  };
  
  if (isLoading) return <div className="flex items-center justify-center h-48">Villa bilgileri yükleniyor...</div>;
  if (isError) return <div className="bg-destructive/10 p-4 rounded-lg text-destructive">Hata: {error?.message}</div>;
  if (!villa) return <div className="bg-muted p-4 rounded-lg">Villa bulunamadı.</div>;
  
  // Durum renkleri ve etiketleri
  const statusConfig: Record<VillaStatus, { color: string, label: string }> = {
    ACTIVE: { color: 'bg-green-100 text-green-800', label: 'Aktif' },
    INACTIVE: { color: 'bg-gray-100 text-gray-800', label: 'Pasif' },
    PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Beklemede' },
    DELETED: { color: 'bg-red-100 text-red-800', label: 'Silinmiş' },
  };
  
  const isDeleting = deleteVillaMutation.isPending || deactivateVillaMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold font-montserrat text-primary">{villa.title}</h1>
          <p className="text-sm text-muted-foreground">{villa.slug}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/villa-kiralama/${villa.slug}`} target="_blank">
              Önizleme
            </Link>
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            asChild
          >
            <Link href={`/protected/admin/villas/${villa.id}/edit`}>
              Düzenle
            </Link>
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
          >
            {isDeleting ? 'İşleniyor...' : 'Sil'}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={villa.status === 'ACTIVE' ? 'default' : villa.status === 'DELETED' ? 'destructive' : villa.status === 'PENDING' ? 'secondary' : 'outline'}>
                {statusConfig[villa.status].label}
              </Badge>
              
              {villa.isPromoted && (
                <Badge variant="secondary">Öne Çıkan</Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              ID: <span className="font-mono text-xs">{villa.id}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground pt-2">
            <span>
              Oluşturulma: {new Date(villa.createdAt).toLocaleDateString('tr-TR')}
            </span>
            
            <span>
              Güncelleme: {new Date(villa.updatedAt).toLocaleDateString('tr-TR')}
            </span>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Detaylar</TabsTrigger>
              <TabsTrigger value="rules">Kurallar</TabsTrigger>
              <TabsTrigger value="notes">Notlar</TabsTrigger>
              <TabsTrigger value="technical">Teknik</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Temel Bilgiler */}
                <div className="space-y-3">
                  <h3 className="font-medium text-lg font-montserrat text-primary">Temel Bilgiler</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bölge:</span>
                      <span className="font-medium">{villa.mainRegion} / {villa.subRegion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kapasite:</span>
                      <span className="font-medium">{villa.maxGuests} Misafir</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Yatak Odası:</span>
                      <span className="font-medium">{villa.bedrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Banyo:</span>
                      <span className="font-medium">{villa.bathrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Minimum Konaklama:</span>
                      <span className="font-medium">{villa.minimumStay} Gece</span>
                    </div>
                    {villa.shortStayDayLimit && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kısa Konaklama Sınırı:</span>
                        <span className="font-medium">{villa.shortStayDayLimit} Gün</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Fiyatlandırma */}
                <div className="space-y-3">
                  <h3 className="font-medium text-lg font-montserrat text-primary">Fiyatlandırma</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Depozito:</span>
                      <span className="font-medium">{villa.deposit} TL</span>
                    </div>
                    {villa.cleaningFee !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Temizlik Ücreti:</span>
                        <span className="font-medium">{villa.cleaningFee} TL</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ön Ödeme Oranı:</span>
                      <span className="font-medium">%{villa.advancePaymentRate}</span>
                    </div>
                  </div>
                </div>
                
                {/* Giriş/Çıkış */}
                <div className="space-y-3">
                  <h3 className="font-medium text-lg font-montserrat text-primary">Giriş/Çıkış</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Giriş Saati:</span>
                      <span className="font-medium">{villa.checkInTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Çıkış Saati:</span>
                      <span className="font-medium">{villa.checkOutTime}</span>
                    </div>
                  </div>
                </div>
                
                {/* Açıklama */}
                <div className="md:col-span-3">
                  <h3 className="font-medium text-lg font-montserrat text-primary mb-2">Açıklama</h3>
                  <p className="whitespace-pre-wrap text-card-foreground">{villa.description}</p>
                </div>
                
                {/* Etiketler */}
                <div className="md:col-span-3">
                  <h3 className="font-medium text-lg font-montserrat text-primary mb-2">Etiketler</h3>
                  {villa.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {villa.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="bg-accent/10">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Etiketler eklenmemiş</p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="rules" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kurallar */}
                <div className="space-y-3">
                  <h3 className="font-medium text-lg font-montserrat text-primary">Kurallar</h3>
                  {villa.rules.length > 0 ? (
                    <ul className="space-y-2">
                      {villa.rules.map((rule) => (
                        <li key={rule} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Kurallar eklenmemiş</p>
                  )}
                </div>
                
                {/* Ev Kuralları */}
                <div className="space-y-3">
                  <h3 className="font-medium text-lg font-montserrat text-primary">Ev Kuralları</h3>
                  {villa.houseRules.length > 0 ? (
                    <ul className="space-y-2">
                      {villa.houseRules.map((rule) => (
                        <li key={rule} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Ev kuralları eklenmemiş</p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notes" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-lg font-montserrat text-primary mb-2">Giriş Notları</h3>
                  <div className="bg-muted p-3 rounded-md h-40 overflow-y-auto">
                    <p className="whitespace-pre-wrap">{villa.checkInNotes || 'Not eklenmemiş'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg font-montserrat text-primary mb-2">Çıkış Notları</h3>
                  <div className="bg-muted p-3 rounded-md h-40 overflow-y-auto">
                    <p className="whitespace-pre-wrap">{villa.checkOutNotes || 'Not eklenmemiş'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg font-montserrat text-primary mb-2">İptal Koşulları</h3>
                  <div className="bg-muted p-3 rounded-md h-40 overflow-y-auto">
                    <p className="whitespace-pre-wrap">{villa.cancellationNotes || 'Not eklenmemiş'}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="technical" className="space-y-6">
              {/* Embed Kodu */}
              {villa.embedCode && (
                <div>
                  <h3 className="font-medium text-lg font-montserrat text-primary mb-2">Embed Kodu</h3>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                    {villa.embedCode}
                  </pre>
                </div>
              )}
              
              {/* Çeviriler */}
              {villa.translations && (
                <div>
                  <h3 className="font-medium text-lg font-montserrat text-primary mb-2">Çeviriler</h3>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(villa.translations, null, 2)}
                  </pre>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Silme Onay Modalı */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-montserrat">Villayı Sil</DialogTitle>
            <DialogDescription>
              &quot;{villa.title}&quot; villasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  id="soft-delete"
                  type="radio"
                  name="delete-type"
                  value="soft"
                  checked={deleteMode === 'soft'}
                  onChange={() => setDeleteMode('soft')}
                  className="h-4 w-4 border border-input"
                />
                <label htmlFor="soft-delete" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  <span className="font-medium">Deaktif Et</span> - Villa pasife alınır, daha sonra tekrar aktif edilebilir
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="hard-delete"
                  type="radio"
                  name="delete-type"
                  value="hard"
                  checked={deleteMode === 'hard'}
                  onChange={() => setDeleteMode('hard')}
                  className="h-4 w-4 border border-input"
                />
                <label htmlFor="hard-delete" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  <span className="font-medium text-destructive">Tamamen Sil</span> - Villa veritabanından kalıcı olarak silinir
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              İptal
            </Button>
            
            <Button
              variant={deleteMode === 'hard' ? 'destructive' : 'secondary'}
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting 
                ? 'İşleniyor...' 
                : deleteMode === 'hard' 
                  ? 'Tamamen Sil' 
                  : 'Deaktif Et'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 