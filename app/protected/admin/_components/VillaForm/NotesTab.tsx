import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { TabProps } from './types';

export function NotesTab({ formData, helpers }: TabProps) {
  const { handleInputChange } = helpers;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold font-montserrat text-primary">
          Giriş/Çıkış Bilgileri ve Notlar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="checkInTime">
              Giriş Saati <span className="text-destructive">*</span>
            </Label>
            <Input
              id="checkInTime"
              name="checkInTime"
              type="text"
              value={formData.checkInTime}
              onChange={handleInputChange}
              placeholder="16:00"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="checkOutTime">
              Çıkış Saati <span className="text-destructive">*</span>
            </Label>
            <Input
              id="checkOutTime"
              name="checkOutTime"
              type="text"
              value={formData.checkOutTime}
              onChange={handleInputChange}
              placeholder="10:00"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="checkInNotes">
              Giriş Notları
            </Label>
            <Textarea
              id="checkInNotes"
              name="checkInNotes"
              value={formData.checkInNotes ?? ''}
              onChange={handleInputChange}
              rows={3}
              placeholder="Giriş yapacak misafirler için notlar..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="checkOutNotes">
              Çıkış Notları
            </Label>
            <Textarea
              id="checkOutNotes"
              name="checkOutNotes"
              value={formData.checkOutNotes ?? ''}
              onChange={handleInputChange}
              rows={3}
              placeholder="Çıkış yapacak misafirler için notlar..."
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cancellationNotes">
            İptal Koşulları
          </Label>
          <Textarea
            id="cancellationNotes"
            name="cancellationNotes"
            value={formData.cancellationNotes ?? ''}
            onChange={handleInputChange}
            rows={3}
            placeholder="Rezervasyon iptali ile ilgili koşullar..."
          />
        </div>
      </CardContent>
    </Card>
  );
} 