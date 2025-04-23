import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VillaSeasonalPrices } from './VillaSeasonalPrices';
import type { TabProps } from './types';

export function PricingTab({ formData, helpers }: TabProps) {
  const { handleInputChange, initialData } = helpers;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold font-montserrat text-primary">
            Temel Fiyatlandırma
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deposit">
                Depozito <span className="text-destructive">*</span>
              </Label>
              <Input
                id="deposit"
                name="deposit"
                type="number"
                min="0"
                step="0.01"
                value={formData.deposit || ''}
                onChange={handleInputChange}
                required
              />
              <p className="text-xs text-muted-foreground">TL</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cleaningFee">
                Temizlik Ücreti
              </Label>
              <Input
                id="cleaningFee"
                name="cleaningFee"
                type="number"
                min="0"
                step="0.01"
                value={formData.cleaningFee || ''}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">TL (Opsiyonel)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="advancePaymentRate">
                Ön Ödeme Oranı (%)
              </Label>
              <Input
                id="advancePaymentRate"
                name="advancePaymentRate"
                type="number"
                min="0"
                max="100"
                step="1"
                value={formData.advancePaymentRate || ''}
                onChange={handleInputChange}
              />
              <p className="text-xs text-muted-foreground">% (Yüzde)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortStayDayLimit">
                Kısa Konaklama Gün Limiti
              </Label>
              <Input
                id="shortStayDayLimit"
                name="shortStayDayLimit"
                type="number"
                min="0"
                step="1"
                value={formData.shortStayDayLimit || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sezonsal fiyatlandırma bileşeni - Sadece kayıtlı villalar için göster */}
      {initialData && initialData.id && (
        <VillaSeasonalPrices villaId={initialData.id} />
      )}
    </div>
  );
} 