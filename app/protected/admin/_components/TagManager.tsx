"use client";

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tagApi } from '@/utils/api-client';
import type { Tag } from '@/app/api/tags/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Pencil, Trash2, Plus, Search, X } from 'lucide-react';

// ApiError ve standart Error tiplerini kabul eden interface
interface ErrorWithMessage {
  message?: string;
}

const TagManager = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTag, setEditingTag] = useState<{ id: string; name: string } | null>(null);
  const [newTagName, setNewTagName] = useState('');

  // Tüm etiketleri getirme sorgusu
  const {
    data: tagsData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['tags', searchTerm],
    queryFn: () => tagApi.getTags(searchTerm),
  });

  // Yeni etiket ekleme mutasyonu
  const createTagMutation = useMutation({
    mutationFn: (name: string) => tagApi.createTag(name),
    onSuccess: () => {
      // Başarıyla eklendiğinde
      toast.success('Etiket başarıyla eklendi');
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setNewTagName(''); // Formu temizle
    },
    onError: (error: ErrorWithMessage) => {
      toast.error(`Etiket eklenirken hata: ${error?.message || 'Bilinmeyen bir hata oluştu'}`);
    }
  });

  // Etiket güncelleme mutasyonu
  const updateTagMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => tagApi.updateTag(id, name),
    onSuccess: () => {
      toast.success('Etiket başarıyla güncellendi');
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      setEditingTag(null); // Düzenleme modunu kapat
    },
    onError: (error: ErrorWithMessage) => {
      toast.error(`Etiket güncellenirken hata: ${error?.message || 'Bilinmeyen bir hata oluştu'}`);
    }
  });

  // Etiket silme mutasyonu
  const deleteTagMutation = useMutation({
    mutationFn: (id: string) => tagApi.deleteTag(id),
    onSuccess: () => {
      toast.success('Etiket başarıyla silindi');
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (error: ErrorWithMessage) => {
      toast.error(`Etiket silinirken hata: ${error?.message || 'Bilinmeyen bir hata oluştu'}`);
    }
  });

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    createTagMutation.mutate(newTagName);
  };

  const handleUpdateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag || !editingTag.name.trim()) return;
    updateTagMutation.mutate({
      id: editingTag.id,
      name: editingTag.name,
    });
  };

  const handleDeleteTag = (id: string, name: string) => {
    if (window.confirm(`"${name}" etiketini silmek istediğinizden emin misiniz?`)) {
      deleteTagMutation.mutate(id);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Etiket Yönetimi</CardTitle>
        <CardDescription>
          Sistemde kullanılan etiketleri ekleyebilir, düzenleyebilir veya silebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Arama bölümü */}
        <div className="flex mb-6 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Etiket ara..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Etiket ekleme formu */}
        <div className="mb-6">
          <form onSubmit={handleAddTag} className="flex gap-2">
            <Input
              type="text"
              placeholder="Yeni etiket adı..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="sm"
              disabled={createTagMutation.isPending || !newTagName.trim()}
            >
              {createTagMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" /> 
                  Ekle
                </>
              )}
            </Button>
          </form>
        </div>
        
        {/* Etiketler listesi */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-red-500">
            Etiketler yüklenirken bir hata oluştu: {(error as Error)?.message}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Etiket Adı</TableHead>
                <TableHead>Oluşturulma Tarihi</TableHead>
                <TableHead className="w-[100px] text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tagsData?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    {searchTerm ? 'Aramanızla eşleşen etiket bulunamadı.' : 'Henüz etiket eklenmemiş.'}
                  </TableCell>
                </TableRow>
              ) : (
                tagsData?.data?.map((tag: Tag) => (
                  <TableRow key={tag.id}>
                    <TableCell>
                      {editingTag?.id === tag.id ? (
                        <form onSubmit={handleUpdateTag} className="flex gap-2">
                          <Input
                            type="text"
                            value={editingTag.name}
                            onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                            autoFocus
                            className="py-1 h-8"
                          />
                          <Button 
                            type="submit" 
                            size="sm"
                            variant="outline"
                            disabled={updateTagMutation.isPending || !editingTag.name.trim() || editingTag.name === tag.name}
                          >
                            {updateTagMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Kaydet'}
                          </Button>
                          <Button 
                            type="button" 
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingTag(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </form>
                      ) : (
                        tag.name
                      )}
                    </TableCell>
                    <TableCell>
                      {tag.createdAt ? new Date(tag.createdAt).toLocaleDateString('tr-TR') : '-'}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {editingTag?.id !== tag.id && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingTag({ id: tag.id, name: tag.name })}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTag(tag.id, tag.name)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default TagManager; 