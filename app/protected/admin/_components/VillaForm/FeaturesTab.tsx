import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { TabProps } from './types';
import { VillaTagsSelector } from './VillaTagsSelector';
import VillaAmenitiesManager from '@/app/protected/admin/_components/VillaAmenitiesManager';

export function FeaturesTab({ formData, helpers }: TabProps) {
  const { handleInputChange } = helpers;
  // Villa ID'sini initialData üzerinden kontrol et (düzenleme modu)
  const isEditMode = !!helpers.initialData?.id;
  const villaId = helpers.initialData?.id;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold font-montserrat text-primary">
            Kapasite ve Özellikler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">
                Yatak Odası <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min="1"
                value={formData.bedrooms || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bathrooms">
                Banyo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                min="1"
                value={formData.bathrooms || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxGuests">
                Maks. Misafir <span className="text-destructive">*</span>
              </Label>
              <Input
                id="maxGuests"
                name="maxGuests"
                type="number"
                min="1"
                value={formData.maxGuests || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minimumStay">
                Min. Konaklama <span className="text-destructive">*</span>
              </Label>
              <Input
                id="minimumStay"
                name="minimumStay"
                type="number"
                min="1"
                value={formData.minimumStay || ''}
                onChange={handleInputChange}
                required
              />
              <p className="text-xs text-muted-foreground">Gece sayısı</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortStayDayLimit">
                Kısa Konaklama Sınırı
              </Label>
              <Input
                id="shortStayDayLimit"
                name="shortStayDayLimit"
                type="number"
                min="0"
                value={formData.shortStayDayLimit === null || formData.shortStayDayLimit === undefined ? '' : formData.shortStayDayLimit}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">Opsiyonel</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Villa Etiketleri Bileşeni - Hem ekleme hem düzenleme modunda göster */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold font-montserrat text-primary">
            Villa Etiketleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditMode && villaId ? (
            // Düzenleme modu - VillaTagsSelector ile mevcut etiketleri yönet
            <VillaTagsSelector villaId={villaId} />
          ) : (
            // Ekleme modu - Yeni etiketler için açıklama
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Villa kayıt edildikten sonra etiketleri ekleyebilirsiniz.
              </p>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="isPromotedFeature" disabled />
                <Label htmlFor="isPromotedFeature" className="text-muted-foreground">
                  Öne çıkan villa olarak işaretle (Kayıt sonrası düzenleyebilirsiniz)
                </Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Villa Olanakları Bileşeni - Sadece düzenleme modunda göster */}
      {isEditMode && villaId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold font-montserrat text-primary">
              Villa Olanakları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VillaAmenitiesManager 
              villaId={villaId} 
              villaName={helpers.initialData?.title}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
} 