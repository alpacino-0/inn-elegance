import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TabProps } from './types';

export function FeaturesTab({ formData, helpers }: TabProps) {
  const { handleInputChange } = helpers;

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
    </div>
  );
} 