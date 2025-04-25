import { useVillaTags, useAddVillaTag, useRemoveVillaTag, useTags, useUpdateVillaTagsField } from '@/hooks/use-villa-queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X, Database, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface VillaTagsSelectorProps {
  villaId?: string;
  className?: string;
}

export function VillaTagsSelector({ villaId, className }: VillaTagsSelectorProps) {
  // Tüm etiketleri getir
  const { data: allTags, isLoading: isLoadingTags } = useTags();
  
  // Villa için var olan etiketleri getir
  const { data: villaTags, isLoading: isLoadingVillaTags } = useVillaTags(villaId || '', {
    enabled: !!villaId,
  });
  
  // Etiket ekleme ve kaldırma mutasyonları
  const addVillaTag = useAddVillaTag(villaId || '');
  const removeVillaTag = useRemoveVillaTag(villaId || '');
  
  // SQL sorgusunu çalıştırmak için mutation
  const updateTagsField = useUpdateVillaTagsField();
  
  const isLoading = isLoadingTags || isLoadingVillaTags;
  const isAdding = addVillaTag.isPending;
  const isRemoving = removeVillaTag.isPending;
  const isUpdatingTagsField = updateTagsField.isPending;

  // Etiket ekle
  const handleAddTag = (tagId: string) => {
    if (!villaId) return;
    addVillaTag.mutate(tagId);
  };

  // Etiket kaldır
  const handleRemoveTag = (tagId: string) => {
    if (!villaId) return;
    removeVillaTag.mutate(tagId);
  };

  // Etiketin seçili olup olmadığını kontrol et
  const isTagSelected = (tagId: string) => {
    return villaTags?.data?.some(tag => tag.id === tagId) || false;
  };

  // Checkbox değişimini işle
  const handleCheckboxChange = (tagId: string, checked: boolean) => {
    if (checked) {
      handleAddTag(tagId);
    } else {
      handleRemoveTag(tagId);
    }
  };

  // SQL sorgusunu çalıştır ve tags alanını güncelle
  const handleUpdateTagsField = () => {
    updateTagsField.mutate(undefined, {
      onSuccess: (response) => {
        if (response.error) {
          toast.error(`Hata: ${response.error.message || 'Etiketler güncellenirken bir hata oluştu'}`);
        } else {
          toast.success('Tüm villaların etiket alanları başarıyla güncellendi');
        }
      },
      onError: (error) => {
        toast.error(`Hata: ${error?.message || 'Etiketler güncellenirken bir hata oluştu'}`);
      }
    });
  };

  return (
    <div className={className}>
      {/* SQL Güncelleme Butonu */}
      <div className="flex justify-end mb-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleUpdateTagsField}
          disabled={isUpdatingTagsField}
        >
          {isUpdatingTagsField ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Güncelleniyor...</span>
            </>
          ) : (
            <>
              <Database className="h-4 w-4" />
              <span>Tüm Villa Etiketlerini Güncelle</span>
            </>
          )}
        </Button>
      </div>
    
      {/* Durum mesajları */}
      {(addVillaTag.isError || removeVillaTag.isError) && (
        <div className="text-sm text-destructive mb-4">
          {addVillaTag.isError && 
            `Etiket eklenirken hata oluştu: ${addVillaTag.error.message}`}
          {removeVillaTag.isError && 
            `Etiket kaldırılırken hata oluştu: ${removeVillaTag.error.message}`}
        </div>
      )}

      {/* Etiket seçimi */}
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Etiketler yükleniyor...</div>
      ) : !allTags?.data || allTags.data.length === 0 ? (
        <div className="text-sm text-muted-foreground">Henüz hiç etiket tanımlanmamış</div>
      ) : (
        <div>
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Mevcut Etiketler</h4>
            <div className="flex flex-wrap gap-2">
              {villaTags?.data && villaTags.data.length > 0 ? (
                villaTags.data.map(tag => (
                  <Badge 
                    key={tag.id} 
                    variant="secondary"
                    className="flex items-center gap-1 pl-3 py-1.5"
                  >
                    {tag.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 ml-1 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleRemoveTag(tag.id)}
                      disabled={isRemoving}
                      title="Etiketi kaldır"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Bu villa için etiket bulunmuyor</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
            <h4 className="text-sm font-medium mb-2 col-span-full">Etiket Ekle/Kaldır</h4>
            {allTags.data.map(tag => (
              <div key={tag.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`tag-${tag.id}`}
                  checked={isTagSelected(tag.id)}
                  onCheckedChange={(checked) => handleCheckboxChange(tag.id, checked as boolean)}
                  disabled={isAdding || isRemoving}
                />
                <Label htmlFor={`tag-${tag.id}`} className="cursor-pointer">
                  {tag.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 