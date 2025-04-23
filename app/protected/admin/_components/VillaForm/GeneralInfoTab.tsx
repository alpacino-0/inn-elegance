import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TabProps } from './types';

export function GeneralInfoTab({ formData, helpers }: TabProps) {
  const { handleInputChange, handleSelectChange, handleCheckboxChange } = helpers;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold font-montserrat text-primary">
          Temel Bilgiler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Başlık <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Villa Adı"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-destructive">*</span>
            </Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="villa-adi"
              required
            />
            <p className="text-xs text-muted-foreground">
              URL-dostu tekil değer (örn: luxury-villa-marmaris)
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">
            Açıklama <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Villa hakkında detaylı açıklama..."
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">
              Durum <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="INACTIVE">Pasif</SelectItem>
                <SelectItem value="PENDING">Beklemede</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2 pt-8">
            <Checkbox 
              id="isPromoted" 
              checked={formData.isPromoted}
              onCheckedChange={(checked) => handleCheckboxChange('isPromoted', checked as boolean)}
            />
            <Label htmlFor="isPromoted" className="cursor-pointer">
              Öne çıkarılsın mı?
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 