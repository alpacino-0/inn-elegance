import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { TabProps } from './types';

export function AdvancedTab({ formData, helpers }: TabProps) {
  const { handleInputChange, handleTranslationsChange } = helpers;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold font-montserrat text-primary">
          Gelişmiş Ayarlar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
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
        
        <div className="space-y-2">
          <Label htmlFor="translations">
            Çeviriler (JSON)
          </Label>
          <Textarea
            id="translations"
            name="translations"
            value={formData.translations ? JSON.stringify(formData.translations, null, 2) : ''}
            onChange={(e) => handleTranslationsChange(e.target.value)}
            rows={5}
            className="font-mono text-sm"
            placeholder='{"en": {"title": "English Title", "description": "English Description"}}'
          />
          <p className="text-xs text-muted-foreground">
            Geçerli JSON formatında dil kodlarına göre çevirileri yazın
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 