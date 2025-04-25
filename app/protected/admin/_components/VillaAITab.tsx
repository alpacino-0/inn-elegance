'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save, Clipboard, Wand2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVillaById } from '@/hooks/use-villa-queries';

interface VillaAITabProps {
  villaId: string;
}

export default function VillaAITab({ villaId }: VillaAITabProps) {
  const [fullDescription, setFullDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { data: villaData, refetch } = useVillaById(villaId);
  const villa = villaData?.data;

  const generateFullDescription = async () => {
    if (!villaId) {
      toast.error("Villa ID bulunamadı");
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ villaId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Tam açıklama üretilemedi');
      }

      if (data.fullDescription) {
        setFullDescription(data.fullDescription);
        toast.success("Villa açıklaması başarıyla oluşturuldu");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Açıklama üretilirken bir hata oluştu';
      toast.error(`Hata Oluştu: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDescription = async () => {
    if (!villaId || !fullDescription.trim()) {
      toast.error("Villa ID bulunamadı veya açıklama boş");
      return;
    }

    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/generate-seo/${villaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          villaId,
          description: fullDescription 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Açıklama kaydedilemedi');
      }

      await refetch(); // Villa verilerini yeniden yükle
      toast.success("Açıklama villa kaydına başarıyla kaydedildi");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Açıklama kaydedilirken bir hata oluştu';
      toast.error(`Hata Oluştu: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Metin panoya kopyalandı");
    }).catch((err) => {
      toast.error(`Metin kopyalanamadı: ${err}`);
    });
  };

  if (!villa) {
    return <div className="bg-muted p-4 rounded-lg">Villa bilgileri yüklenemedi.</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xl font-bold font-montserrat text-primary">Villa Açıklaması Üreticisi</CardTitle>
        <Button 
          type="button" 
          size="sm" 
          variant="outline"
          onClick={generateFullDescription}
          disabled={isGenerating}
          className="ml-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Oluşturuluyor...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Açıklama Oluştur
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="Villa için detaylı pazarlama açıklaması oluşturmak için butona tıklayın..."
            className="min-h-[300px] text-sm leading-relaxed font-mono"
            style={{
              fontFamily: 'Consolas, monospace'
            }}
            disabled={isGenerating}
          />
          
          <div className="flex justify-between items-center">
            <div className="flex text-xs text-muted-foreground">
              <span>Kelime sayısı: {fullDescription.split(/\s+/).filter(Boolean).length}</span>
            </div>
            
            <div className="flex gap-2">
              {fullDescription && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(fullDescription)}
                  >
                    <Clipboard className="mr-2 h-4 w-4" />
                    Panoya Kopyala
                  </Button>
                  
                  <Button 
                    size="sm" 
                    onClick={saveDescription}
                    disabled={isSaving || isGenerating}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Villa Kaydına Uygula
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 mt-4 rounded-md border text-sm">
            <p className="text-muted-foreground">
              <b>İpucu:</b> Oluşturulan açıklama, 4 paragraftan oluşan, villanızın özelliklerini vurgulayan ve potansiyel müşterileri etkilemek için SEO dostu bir metin olacaktır. Açıklama oluşturulduktan sonra metni kopyalayıp villa detay sayfasında kullanabilir veya doğrudan villa kaydına uygulayabilirsiniz.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 