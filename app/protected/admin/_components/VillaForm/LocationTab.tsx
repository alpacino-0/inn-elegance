import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { TabProps } from './types';

export function LocationTab({ formData, helpers }: TabProps) {
  const { 
    mainRegions, 
    subRegions, 
    isRegionSelected, 
    showSubRegionSelect, 
    handleSelectChange,
    handleInputChange
  } = helpers;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold font-montserrat text-primary">
          Konum Bilgileri
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="regionId">
              Ana Bölge <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={formData.regionId} 
              onValueChange={(value) => handleSelectChange('regionId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ana Bölge Seçin" />
              </SelectTrigger>
              <SelectContent>
                {mainRegions.map(region => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subRegionId">
              Alt Bölge <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={formData.subRegionId} 
              onValueChange={(value) => handleSelectChange('subRegionId', value)}
              disabled={!isRegionSelected}
            >
              <SelectTrigger>
                <SelectValue placeholder={isRegionSelected ? "Alt Bölge Seçin" : "Önce ana bölge seçin"} />
              </SelectTrigger>
              <SelectContent>
                {showSubRegionSelect && subRegions.map(region => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isRegionSelected && (
              <p className="text-xs text-muted-foreground">
                Önce ana bölge seçmelisiniz
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2 mt-2">
          <Label htmlFor="embedCode">
            Embed Kodu
          </Label>
          <Textarea
            id="embedCode"
            name="embedCode"
            value={formData.embedCode ?? ''}
            onChange={handleInputChange}
            rows={3}
            placeholder="İframe veya embed kodu"
          />
        </div>
      </CardContent>
    </Card>
  );
} 