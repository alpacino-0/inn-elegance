import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import type { TabProps } from './types';

// Önceden tanımlanmış kurallar
const PREDEFINED_RULES = [
  "Sigara İçilmez",
  "Evcil Hayvan Giremez",
  "Parti Düzenlenemez",
  "Çocuklara Uygun (2-12)",
  "Bebeklere Uygun (0-2)"
];

export function RulesTab({ formData, helpers }: TabProps) {
  const { handleArrayChange, updateFormData } = helpers;
  const [customRule, setCustomRule] = useState('');

  // Dizilere varsayılan değer atama
  const rules = formData.rules || [];
  const houseRules = formData.houseRules || [];

  // Checkbox değişikliğini işleyecek fonksiyon
  const handleRuleCheckboxChange = (rule: string, checked: boolean) => {
    const currentRules = [...rules];
    
    if (checked && !currentRules.includes(rule)) {
      // Kural ekleme
      updateFormData({ rules: [...currentRules, rule] });
    } else if (!checked && currentRules.includes(rule)) {
      // Kural kaldırma
      updateFormData({ rules: currentRules.filter(r => r !== rule) });
    }
  };

  // Özel kural ekleme
  const handleAddCustomRule = () => {
    if (customRule.trim() && !rules.includes(customRule.trim())) {
      updateFormData({ rules: [...rules, customRule.trim()] });
      setCustomRule('');
    }
  };

  // Kural kaldırma
  const handleRemoveRule = (rule: string) => {
    updateFormData({ rules: rules.filter(r => r !== rule) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold font-montserrat text-primary">
          Kurallar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              Kurallar <span className="text-destructive">*</span>
            </Label>
            
            {/* Önceden tanımlanmış kurallar */}
            <div className="space-y-2 border rounded-md p-3">
              <Label className="text-sm font-medium">Hazır Kurallar</Label>
              <div className="grid grid-cols-1 gap-2">
                {PREDEFINED_RULES.map(rule => (
                  <div key={rule} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`rule-${rule}`}
                      checked={rules.includes(rule)}
                      onCheckedChange={(checked) => handleRuleCheckboxChange(rule, checked as boolean)}
                    />
                    <Label htmlFor={`rule-${rule}`} className="cursor-pointer">
                      {rule}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Özel kural ekleme */}
            <div className="border rounded-md p-3">
              <Label className="text-sm font-medium">Özel Kural Ekle</Label>
              <div className="flex mt-2 space-x-2">
                <Input
                  placeholder="Yeni kural..."
                  value={customRule}
                  onChange={(e) => setCustomRule(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={handleAddCustomRule}
                  disabled={!customRule.trim()}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Ekle
                </Button>
              </div>
            </div>
            
            {/* Seçilen kurallar */}
            {rules.length > 0 && (
              <div className="border rounded-md p-3">
                <Label className="text-sm font-medium">Seçilen Kurallar</Label>
                <div className="pt-2 flex flex-wrap">
                  {rules.map(rule => (
                    <Badge 
                      key={rule} 
                      variant="outline" 
                      className="mr-1 mb-1 cursor-pointer"
                      onClick={() => handleRemoveRule(rule)}
                    >
                      {rule} ×
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="houseRules">
              Ev Kuralları <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="houseRules"
              name="houseRules"
              value={houseRules.join(', ')}
              onChange={(e) => handleArrayChange('houseRules', e.target.value)}
              required
              placeholder="Virgülle ayırın (örn: çöpleri çıkarın, kapıyı kilitleyin)"
            />
            <div className="pt-2 flex flex-wrap">
              {houseRules.map(rule => (
                <Badge key={rule} variant="outline" className="mr-1 mb-1">{rule}</Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 