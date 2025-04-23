"use client";

import { useState } from 'react';
import { useActiveCurrencies, useCreateCurrency, useUpdateCurrency, useDeleteCurrency, useDeactivateCurrency } from '@/hooks/useCurrency';
import { toast } from 'sonner';
import type { Currency, CreateCurrencyDto, UpdateCurrencyDto } from '@/types/currency';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Loader2, Pencil, Trash2, Plus, XCircle, Calendar, RotateCw, Check, Eye, EyeOff, AlertTriangle } from 'lucide-react';

// Para birimi ekleme formu
const AddCurrencyForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCurrencyDto>({
    code: '',
    name: '',
    symbol: '',
    exchangeRate: 1,
    isDefault: false,
    isActive: true,
    autoUpdate: true,
    updateInterval: 60
  });

  const createCurrency = useCreateCurrency();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : (type === 'number' ? parseFloat(value) : value)
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createCurrency.mutate(formData, {
      onSuccess: () => {
        toast.success('Para birimi başarıyla eklendi');
        setIsOpen(false);
        setFormData({
          code: '',
          name: '',
          symbol: '',
          exchangeRate: 1,
          isDefault: false,
          isActive: true,
          autoUpdate: true,
          updateInterval: 60
        });
      },
      onError: (error) => {
        toast.error(`Hata: ${error.message}`);
      }
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <Plus className="mr-2 h-4 w-4" /> Para Birimi Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Para Birimi Ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Kod (Ör: USD, EUR)</Label>
              <Input 
                id="code" 
                name="code" 
                value={formData.code} 
                onChange={handleChange} 
                maxLength={3}
                required 
                placeholder="USD"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symbol">Sembol</Label>
              <Input 
                id="symbol" 
                name="symbol" 
                value={formData.symbol} 
                onChange={handleChange} 
                required 
                placeholder="$"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Para Birimi Adı</Label>
            <Input 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              placeholder="Amerikan Doları"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="exchangeRate">Kur Değeri</Label>
            <Input 
              id="exchangeRate" 
              name="exchangeRate" 
              type="number" 
              step="0.01"
              min="0.01"
              value={formData.exchangeRate} 
              onChange={handleChange} 
              required 
              placeholder="1.00"
            />
            <p className="text-xs text-muted-foreground">Varsayılan para birimine göre değer (1 birim varsayılan = kaç birim bu para birimi)</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isDefault" 
                name="isDefault" 
                checked={formData.isDefault} 
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isDefault: !!checked }))
                } 
              />
              <Label htmlFor="isDefault">Varsayılan Para Birimi</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isActive" 
                name="isActive" 
                checked={formData.isActive} 
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isActive: !!checked }))
                } 
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="autoUpdate" 
                name="autoUpdate" 
                checked={formData.autoUpdate} 
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, autoUpdate: !!checked }))
                } 
              />
              <Label htmlFor="autoUpdate">Otomatik Güncelle</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="updateInterval">Güncelleme Aralığı (dakika)</Label>
            <Input 
              id="updateInterval" 
              name="updateInterval" 
              type="number" 
              min="15"
              value={formData.updateInterval} 
              onChange={handleChange} 
              required 
              disabled={!formData.autoUpdate}
              placeholder="60"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={createCurrency.isPending}
            >
              {createCurrency.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ekleniyor...
                </>
              ) : (
                'Ekle'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Para birimi düzenleme formu
const EditCurrencyForm = ({ currency }: { currency: Currency }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateCurrencyDto>({
    name: currency.name,
    symbol: currency.symbol,
    exchangeRate: currency.exchangeRate,
    isDefault: currency.isDefault,
    isActive: currency.isActive,
    autoUpdate: currency.autoUpdate,
    updateInterval: currency.updateInterval
  });

  const updateCurrency = useUpdateCurrency();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : (type === 'number' ? parseFloat(value) : value)
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateCurrency.mutate({ id: currency.id, updates: formData }, {
      onSuccess: () => {
        toast.success('Para birimi başarıyla güncellendi');
        setIsOpen(false);
      },
      onError: (error) => {
        toast.error(`Hata: ${error.message}`);
      }
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{currency.code} Para Birimini Düzenle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Para Birimi Adı</Label>
            <Input 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="symbol">Sembol</Label>
            <Input 
              id="symbol" 
              name="symbol" 
              value={formData.symbol ?? ''} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="exchangeRate">Kur Değeri</Label>
            <Input 
              id="exchangeRate" 
              name="exchangeRate" 
              type="number" 
              step="0.01"
              min="0.01"
              value={formData.exchangeRate} 
              onChange={handleChange} 
              required 
            />
            <p className="text-xs text-muted-foreground">Varsayılan para birimine göre değer</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isDefault" 
                name="isDefault" 
                checked={formData.isDefault} 
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isDefault: !!checked }))
                } 
              />
              <Label htmlFor="isDefault">Varsayılan Para Birimi</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isActive" 
                name="isActive" 
                checked={formData.isActive} 
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isActive: !!checked }))
                } 
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="autoUpdate" 
                name="autoUpdate" 
                checked={formData.autoUpdate} 
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, autoUpdate: !!checked }))
                } 
              />
              <Label htmlFor="autoUpdate">Otomatik Güncelle</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="updateInterval">Güncelleme Aralığı (dakika)</Label>
            <Input 
              id="updateInterval" 
              name="updateInterval" 
              type="number" 
              min="15"
              value={formData.updateInterval} 
              onChange={handleChange} 
              required 
              disabled={!formData.autoUpdate}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              İptal
            </Button>
            <Button 
              type="submit" 
              disabled={updateCurrency.isPending}
            >
              {updateCurrency.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Para birimi silme/deaktif etme dialogları
const DeleteCurrencyDialog = ({ currency, onDelete }: { currency: Currency, onDelete: (id: string, soft: boolean) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleConfirm = () => {
    onDelete(currency.id, false);
    setIsOpen(false);
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" disabled={currency.isDefault}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Para Birimini Sil</AlertDialogTitle>
          <AlertDialogDescription>
            <p>
              <strong>{currency.code}</strong> para birimini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <p className="mt-2 font-medium text-destructive">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Para birimi fiyatlandırmalarda kullanılıyorsa silinemez.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Sil
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Ana bileşen
const CurrencyManager = () => {
  const { data: currencies, isLoading, isError, error, refetch } = useActiveCurrencies();
  const deleteCurrency = useDeleteCurrency();
  const deactivateCurrency = useDeactivateCurrency();
  const updateCurrency = useUpdateCurrency();
  
  const handleDeleteCurrency = (id: string, soft: boolean) => {
    if (soft) {
      // Deaktif et (soft delete)
      deactivateCurrency.mutate(id, {
        onSuccess: () => {
          toast.success('Para birimi başarıyla devre dışı bırakıldı');
        },
        onError: (error) => {
          toast.error(`Hata: ${error.message}`);
        }
      });
    } else {
      // Tamamen sil (hard delete)
      deleteCurrency.mutate(id, {
        onSuccess: () => {
          toast.success('Para birimi başarıyla silindi');
        },
        onError: (error) => {
          toast.error(`Hata: ${error.message}`);
        }
      });
    }
  };

  const handleToggleActive = (currency: Currency) => {
    updateCurrency.mutate(
      { 
        id: currency.id, 
        updates: { isActive: !currency.isActive } 
      },
      {
        onSuccess: () => {
          toast.success(
            currency.isActive 
              ? 'Para birimi başarıyla devre dışı bırakıldı' 
              : 'Para birimi başarıyla etkinleştirildi'
          );
        },
        onError: (error) => {
          toast.error(`Hata: ${error.message}`);
        }
      }
    );
  };
  
  const getStatusBadge = (currency: Currency) => {
    if (!currency.isActive) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Devre Dışı</span>;
    }
    
    if (currency.isDefault) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Varsayılan</span>;
    }
    
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Aktif</span>;
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: tr });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Para Birimi Yönetimi</CardTitle>
        <CardDescription>
          Sistemdeki para birimlerini yönetin. Varsayılan para birimi fiyat dönüşümleri için referans olarak kullanılır.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <AddCurrencyForm />
          <Button variant="outline" onClick={() => refetch()} title="Yenile">
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-red-500">
            Para birimleri yüklenirken bir hata oluştu: {(error as Error)?.message || 'Bilinmeyen hata'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kod</TableHead>
                <TableHead>Ad</TableHead>
                <TableHead>Sembol</TableHead>
                <TableHead>Kur</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Güncelleme</TableHead>
                <TableHead>Son Güncelleme</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!currencies || currencies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    Henüz para birimi bulunmuyor. Para birimi eklemek için &quot;Para Birimi Ekle&quot; butonunu kullanın.
                  </TableCell>
                </TableRow>
              ) : (
                currencies.map((currency) => (
                  <TableRow key={currency.id} className={!currency.isActive ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{currency.code}</TableCell>
                    <TableCell>{currency.name}</TableCell>
                    <TableCell>{currency.symbol}</TableCell>
                    <TableCell>{currency.exchangeRate}</TableCell>
                    <TableCell>{getStatusBadge(currency)}</TableCell>
                    <TableCell>
                      {currency.autoUpdate ? (
                        <span className="text-green-600 flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          <span>Her {currency.updateInterval} dk</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 flex items-center">
                          <XCircle className="h-4 w-4 mr-1" />
                          <span>Manuel</span>
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {currency.lastUpdated ? (
                        <div className="flex flex-col">
                          <span className="text-xs" title={formatDate(currency.lastUpdated)}>
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {formatDate(currency.lastUpdated)}
                          </span>
                          <span className={`text-xs mt-1 ${
                            currency.lastUpdateStatus === 'success' ? 'text-green-600' : 
                            currency.lastUpdateStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {currency.lastUpdateStatus === 'success' ? 'Başarılı' : 
                             currency.lastUpdateStatus === 'error' ? 'Hatalı' : 'Bekliyor'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Güncellenmedi</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <EditCurrencyForm currency={currency} />
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={currency.isActive ? "text-orange-500" : "text-green-500"}
                          disabled={currency.isDefault}
                          onClick={() => handleToggleActive(currency)}
                          title={currency.isActive ? "Devre Dışı Bırak" : "Etkinleştir"}
                        >
                          {currency.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        
                        <DeleteCurrencyDialog 
                          currency={currency} 
                          onDelete={handleDeleteCurrency} 
                        />
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

export default CurrencyManager; 