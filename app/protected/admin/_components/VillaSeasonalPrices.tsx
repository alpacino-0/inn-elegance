import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useVillaSeasonalPrices, useCurrencies, useCreateSeasonalPrice, useUpdateSeasonalPrice, useDeleteSeasonalPrice } from '@/hooks/use-seasonal-price-queries';
import type { CreateSeasonalPriceDto, UpdateSeasonalPriceDto, SeasonalPrice } from '@/types/seasonal-price';

// UI Bileşenleri
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2, Pencil, X, Calendar, Info } from 'lucide-react';

interface VillaSeasonalPricesProps {
  villaId: string;
}

export function VillaSeasonalPrices({ villaId }: VillaSeasonalPricesProps) {
  // Villa sezon fiyatlarını getir (sadece aktif olanlar)
  const { data, isLoading, isError, error } = useVillaSeasonalPrices(villaId, { isActive: true });
  const prices = data || [];

  if (isLoading) return <div className="py-4">Sezon fiyatları yükleniyor...</div>;
  if (isError) return <div className="py-4 text-destructive">Hata: {error?.message || 'Fiyatlar yüklenemedi'}</div>;

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold font-montserrat text-primary flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Sezonsal Fiyatlandırma
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AddSeasonalPriceForm villaId={villaId} />

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Mevcut Sezon Fiyatları</h3>
          {prices.length === 0 ? (
            <div className="p-4 border rounded-md text-muted-foreground flex items-center justify-center">
              <Info className="h-4 w-4 mr-2" />
              Henüz sezon fiyatı eklenmemiş
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              {prices.map(price => (
                <SeasonalPriceItem 
                  key={price.id} 
                  price={price} 
                  villaId={villaId} 
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Yeni sezon fiyatı ekleme formu
function AddSeasonalPriceForm({ villaId }: { villaId: string }) {
  const { data: currenciesData, isLoading: isLoadingCurrencies } = useCurrencies();
  // Extra güvenlik - array testi
  const currencies = Array.isArray(currenciesData) ? currenciesData : [];
  
  const createMutation = useCreateSeasonalPrice(villaId);
  
  const [formData, setFormData] = useState<CreateSeasonalPriceDto>({
    seasonName: '',
    startDate: '',
    endDate: '',
    nightlyPrice: 0,
    weeklyPrice: null,
    currencyId: '',
    description: '',
    isActive: true
  });
  
  const [useCustomWeeklyPrice, setUseCustomWeeklyPrice] = useState(false);

  // Gecelik fiyat değiştiğinde haftalık fiyatı otomatik hesapla
  useEffect(() => {
    if (!useCustomWeeklyPrice && formData.nightlyPrice) {
      // Haftalık fiyat = Gecelik fiyat * 7
      const calculatedWeeklyPrice = formData.nightlyPrice * 7;
      setFormData(prev => ({ ...prev, weeklyPrice: calculatedWeeklyPrice }));
    }
  }, [formData.nightlyPrice, useCustomWeeklyPrice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Haftalık fiyat manuel değiştirildiğinde
    if (name === 'weeklyPrice' && !useCustomWeeklyPrice) {
      setUseCustomWeeklyPrice(true);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number.parseFloat(value) : 0) : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Haftalık fiyatı sıfırla ve otomatik hesaplamayı etkinleştir
  const resetWeeklyPrice = () => {
    setUseCustomWeeklyPrice(false);
    const nightlyPrice = formData.nightlyPrice || 0;
    if (nightlyPrice > 0) {
      setFormData(prev => ({ ...prev, weeklyPrice: nightlyPrice * 7 }));
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Validation
    if (!formData.seasonName || !formData.startDate || !formData.endDate || !formData.currencyId) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    if (formData.nightlyPrice <= 0) {
      toast.error('Gecelik fiyat sıfırdan büyük olmalıdır');
      return;
    }

    // Başlangıç tarihi bitiş tarihinden önce olmalı
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('Başlangıç tarihi bitiş tarihinden önce olmalıdır');
      return;
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('Sezon fiyatı başarıyla eklendi');
        setFormData({
          seasonName: '',
          startDate: '',
          endDate: '',
          nightlyPrice: 0,
          weeklyPrice: null,
          currencyId: '',
          description: '',
          isActive: true
        });
        setUseCustomWeeklyPrice(false);
      },
      onError: (error) => {
        toast.error(`Hata: ${error?.message || 'Sezon fiyatı eklenirken bir hata oluştu'}`);
      }
    });
  };

  // Eğer para birimleri hala yükleniyor veya hiç para birimi yoksa, giriş formunu göstermeyelim
  if (isLoadingCurrencies) {
    return <div className="py-4">Para birimleri yükleniyor...</div>;
  }

  if (currencies.length === 0) {
    return <div className="py-4 text-destructive">Para birimleri bulunamadı. Lütfen önce para birimi ekleyin.</div>;
  }

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold mb-4">Yeni Sezon Fiyatı Ekle</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="seasonName">Sezon Adı <span className="text-destructive">*</span></Label>
          <Input 
            id="seasonName"
            name="seasonName"
            value={formData.seasonName}
            onChange={handleChange}
            placeholder="Örn: Yaz Sezonu 2024"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="currencyId">Para Birimi <span className="text-destructive">*</span></Label>
          <Select 
            value={formData.currencyId} 
            onValueChange={(value) => handleSelectChange('currencyId', value)}
            disabled={currencies.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Para birimi seçin" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(currency => (
                <SelectItem key={currency.id} value={currency.id}>
                  {currency.code} - {currency.name} ({currency.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="startDate">Başlangıç Tarihi <span className="text-destructive">*</span></Label>
          <Input 
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endDate">Bitiş Tarihi <span className="text-destructive">*</span></Label>
          <Input 
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nightlyPrice">Gecelik Fiyat <span className="text-destructive">*</span></Label>
          <Input 
            id="nightlyPrice"
            name="nightlyPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.nightlyPrice || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="weeklyPrice">
              Haftalık Fiyat {useCustomWeeklyPrice ? 
              <span className="text-xs font-normal text-muted-foreground">(Manuel)</span> : 
              <span className="text-xs font-normal text-muted-foreground">(Otomatik: 7 gece)</span>}
            </Label>
            {useCustomWeeklyPrice && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={resetWeeklyPrice}
                className="h-6 px-2 text-xs"
              >
                Otomatiğe Dön
              </Button>
            )}
          </div>
          <Input 
            id="weeklyPrice"
            name="weeklyPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.weeklyPrice || ''}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2 col-span-full">
          <Label htmlFor="description">Açıklama</Label>
          <Textarea 
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Opsiyonel açıklama"
            rows={2}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => handleCheckboxChange('isActive', checked as boolean)}
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            Aktif (Takvime Eklensin)
          </Label>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button 
          type="button"
          className="bg-primary hover:bg-primary/90 text-white"
          onClick={() => handleSubmit()}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Ekleniyor...' : 'Sezon Fiyatı Ekle'}
        </Button>
      </div>
    </div>
  );
}

// Sezon fiyatı düzenleme/silme bileşeni
function SeasonalPriceItem({ price, villaId }: { price: SeasonalPrice; villaId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateSeasonalPriceDto>({
    seasonName: price.seasonName,
    startDate: price.startDate.substring(0, 10), // YYYY-MM-DD formatına çevir
    endDate: price.endDate.substring(0, 10), // YYYY-MM-DD formatına çevir
    nightlyPrice: price.nightlyPrice,
    weeklyPrice: price.weeklyPrice,
    currencyId: price.currencyId,
    description: price.description,
    isActive: price.isActive
  });
  
  const [useCustomWeeklyPrice, setUseCustomWeeklyPrice] = useState(true);
  
  // İlk yükleme durumunda, eğer haftalık fiyat tam olarak gecelik fiyat * 7 ise, otomatik modu aktifleştir
  useEffect(() => {
    if (isEditing && formData.weeklyPrice !== null && formData.nightlyPrice !== undefined && formData.nightlyPrice > 0) {
      const calculatedWeekly = formData.nightlyPrice * 7;
      // Ondalık hassasiyetten dolayı tam eşitlik kontrolü yerine yakın değer kontrolü
      const isAutoCalculated = Math.abs((formData.weeklyPrice || 0) - calculatedWeekly) < 0.01;
      setUseCustomWeeklyPrice(!isAutoCalculated);
    }
  }, [isEditing, formData.weeklyPrice, formData.nightlyPrice]);
  
  // Gecelik fiyat değiştiğinde haftalık fiyatı otomatik hesapla
  useEffect(() => {
    if (isEditing && !useCustomWeeklyPrice && formData.nightlyPrice !== undefined && formData.nightlyPrice > 0) {
      const calculatedWeeklyPrice = formData.nightlyPrice * 7;
      setFormData(prev => ({ ...prev, weeklyPrice: calculatedWeeklyPrice }));
    }
  }, [formData.nightlyPrice, useCustomWeeklyPrice, isEditing]);
  
  const { data: currenciesData, isLoading: isLoadingCurrencies } = useCurrencies();
  // Extra güvenlik - array testi
  const currencies = Array.isArray(currenciesData) ? currenciesData : [];
  
  const updateMutation = useUpdateSeasonalPrice(price.id, villaId);
  const deleteMutation = useDeleteSeasonalPrice(villaId);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Haftalık fiyat manuel değiştirildiğinde
    if (name === 'weeklyPrice' && !useCustomWeeklyPrice) {
      setUseCustomWeeklyPrice(true);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number.parseFloat(value) : 0) : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Haftalık fiyatı sıfırla ve otomatik hesaplamayı etkinleştir
  const resetWeeklyPrice = () => {
    setUseCustomWeeklyPrice(false);
    const nightlyPrice = formData.nightlyPrice || 0;
    if (nightlyPrice > 0) {
      setFormData(prev => ({ ...prev, weeklyPrice: nightlyPrice * 7 }));
    }
  };

  const handleUpdate = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Validation
    if (!formData.seasonName || !formData.startDate || !formData.endDate || !formData.currencyId) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    if (formData.nightlyPrice !== undefined && formData.nightlyPrice <= 0) {
      toast.error('Gecelik fiyat sıfırdan büyük olmalıdır');
      return;
    }

    // Başlangıç tarihi bitiş tarihinden önce olmalı
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('Başlangıç tarihi bitiş tarihinden önce olmalıdır');
      return;
    }

    updateMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('Sezon fiyatı başarıyla güncellendi');
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error(`Hata: ${error?.message || 'Sezon fiyatı güncellenirken bir hata oluştu'}`);
      }
    });
  };

  const handleDelete = () => {
    if (window.confirm(`"${price.seasonName}" sezon fiyatını silmek istediğinizden emin misiniz?`)) {
      deleteMutation.mutate(price.id, {
        onSuccess: () => {
          toast.success('Sezon fiyatı başarıyla silindi');
        },
        onError: (error) => {
          toast.error(`Hata: ${error?.message || 'Sezon fiyatı silinirken bir hata oluştu'}`);
        }
      });
    }
  };

  const getCurrencySymbol = (currencyId: string) => {
    if (!Array.isArray(currencies)) return '';
    const currency = currencies.find(c => c.id === currencyId);
    return currency?.symbol || '';
  };

  // Para birimleri yükleniyorsa ve eşzamanlı olarak düzenleme moduna geçilmeye çalışılıyorsa
  if (isEditing && isLoadingCurrencies) {
    return <div className="p-3 border rounded-md">Para birimleri yükleniyor...</div>;
  }

  // Düzenleme modu aktif değilse sadece bilgileri göster
  if (!isEditing) {
    return (
      <div className="border rounded-md p-3">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold">{price.seasonName}</h4>
            <div className="text-sm text-muted-foreground mt-1">
              {format(new Date(price.startDate), 'dd.MM.yyyy')} - {format(new Date(price.endDate), 'dd.MM.yyyy')}
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="mr-2">
                Gecelik: {getCurrencySymbol(price.currencyId)}{price.nightlyPrice}
              </Badge>
              {price.weeklyPrice && (
                <Badge variant="outline">
                  Haftalık: {getCurrencySymbol(price.currencyId)}{price.weeklyPrice}
                </Badge>
              )}
            </div>
            {price.description && (
              <p className="text-sm mt-2">{price.description}</p>
            )}
            {!price.isActive && (
              <Badge variant="secondary" className="mt-2">Pasif</Badge>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Düzenleme modu
  return (
    <div className="border rounded-md p-3">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold">{price.seasonName} - Düzenleme</h4>
        <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`seasonName-${price.id}`}>Sezon Adı <span className="text-destructive">*</span></Label>
          <Input 
            id={`seasonName-${price.id}`}
            name="seasonName"
            value={formData.seasonName || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`currencyId-${price.id}`}>Para Birimi <span className="text-destructive">*</span></Label>
          <Select 
            value={formData.currencyId} 
            onValueChange={(value) => handleSelectChange('currencyId', value)}
            disabled={currencies.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Para birimi seçin" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(currency => (
                <SelectItem key={currency.id} value={currency.id}>
                  {currency.code} - {currency.name} ({currency.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`startDate-${price.id}`}>Başlangıç Tarihi <span className="text-destructive">*</span></Label>
          <Input 
            id={`startDate-${price.id}`}
            name="startDate"
            type="date"
            value={formData.startDate || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`endDate-${price.id}`}>Bitiş Tarihi <span className="text-destructive">*</span></Label>
          <Input 
            id={`endDate-${price.id}`}
            name="endDate"
            type="date"
            value={formData.endDate || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`nightlyPrice-${price.id}`}>Gecelik Fiyat <span className="text-destructive">*</span></Label>
          <Input 
            id={`nightlyPrice-${price.id}`}
            name="nightlyPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.nightlyPrice || ''}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor={`weeklyPrice-${price.id}`}>
              Haftalık Fiyat {useCustomWeeklyPrice ? 
              <span className="text-xs font-normal text-muted-foreground">(Manuel)</span> : 
              <span className="text-xs font-normal text-muted-foreground">(Otomatik: 7 gece)</span>}
            </Label>
            {useCustomWeeklyPrice && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={resetWeeklyPrice}
                className="h-6 px-2 text-xs"
              >
                Otomatiğe Dön
              </Button>
            )}
          </div>
          <Input 
            id={`weeklyPrice-${price.id}`}
            name="weeklyPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.weeklyPrice || ''}
            onChange={handleChange}
            placeholder="Opsiyonel"
          />
        </div>
        
        <div className="space-y-2 col-span-full">
          <Label htmlFor={`description-${price.id}`}>Açıklama</Label>
          <Textarea 
            id={`description-${price.id}`}
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Opsiyonel açıklama"
            rows={2}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id={`isActive-${price.id}`}
            checked={formData.isActive}
            onCheckedChange={(checked) => handleCheckboxChange('isActive', checked as boolean)}
          />
          <Label htmlFor={`isActive-${price.id}`} className="cursor-pointer">
            Aktif (Takvime Eklensin)
          </Label>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setIsEditing(false)} 
          className="mr-2"
          disabled={updateMutation.isPending}
        >
          İptal
        </Button>
        <Button 
          type="button" 
          onClick={() => handleUpdate()}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </div>
    </div>
  );
} 