"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { UserCircle, Upload, X, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AvatarUploadProps {
  userId: string;
  currentAvatar: string | null;
  onAvatarChange?: (avatarUrl: string | null) => void;
  className?: string;
}

export default function AvatarUpload({ 
  userId, 
  currentAvatar, 
  onAvatarChange,
  className = '' 
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(currentAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Dosya boyutu kontrolü (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Dosya çok büyük", {
        description: "Lütfen 2 MB'den küçük bir dosya seçin."
      });
      return;
    }
    
    // Dosya tipi kontrolü
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Geçersiz dosya tipi", {
        description: "Lütfen JPEG, PNG veya WEBP formatında bir görsel seçin."
      });
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Eski avatarı sil (varsa)
      if (avatar) {
        const oldAvatarPath = avatar.split('/').pop();
        if (oldAvatarPath) {
          await supabase.storage.from('avatars').remove([oldAvatarPath]);
        }
      }
      
      // Benzersiz bir dosya adı oluştur
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Dosyayı Supabase storage'a yükle
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      // Dosya URL'ini al
      const { data: publicURLData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      const avatarUrl = publicURLData.publicUrl;
      
      // Kullanıcı profilini güncelle
      const { error: updateError } = await supabase
        .from('User')
        .update({ 
          avatar: avatarUrl,
          updatedAt: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      // State'i güncelle
      setAvatar(avatarUrl);
      
      // Callback fonksiyonu çağır (varsa)
      if (onAvatarChange) {
        onAvatarChange(avatarUrl);
      }
      
      toast.success("Avatar güncellendi", {
        description: "Profil fotoğrafınız başarıyla güncellendi."
      });
      
    } catch (error) {
      console.error('Avatar yüklenirken hata oluştu:', error);
      toast.error("Hata oluştu", {
        description: "Avatar güncellenirken bir sorun oluştu. Lütfen tekrar deneyin."
      });
    } finally {
      setIsUploading(false);
      // Input'u temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleRemoveAvatar = async () => {
    if (!avatar) return;
    
    try {
      setIsUploading(true);
      
      // Avatarı storage'dan sil
      const avatarPath = avatar.split('/').pop();
      if (avatarPath) {
        const { error: removeError } = await supabase.storage
          .from('avatars')
          .remove([avatarPath]);
          
        if (removeError) throw removeError;
      }
      
      // Kullanıcı profilini güncelle
      const { error: updateError } = await supabase
        .from('User')
        .update({ 
          avatar: null,
          updatedAt: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      // State'i güncelle
      setAvatar(null);
      
      // Callback fonksiyonu çağır (varsa)
      if (onAvatarChange) {
        onAvatarChange(null);
      }
      
      toast.success("Avatar kaldırıldı", {
        description: "Profil fotoğrafınız başarıyla kaldırıldı."
      });
      
    } catch (error) {
      console.error('Avatar kaldırılırken hata oluştu:', error);
      toast.error("Hata oluştu", {
        description: "Avatar kaldırılırken bir sorun oluştu. Lütfen tekrar deneyin."
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
          {avatar ? (
            <Image
              src={avatar}
              alt="Profil fotoğrafı"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircle className="w-full h-full text-muted-foreground" />
          )}
          
          {isUploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={isUploading}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="flex items-center gap-1"
        >
          <Upload className="w-4 h-4" />
          Fotoğraf Yükle
        </Button>
        
        {avatar && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={isUploading}
            className="flex items-center gap-1 text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4" />
            Kaldır
          </Button>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        JPEG, PNG veya WEBP. Maksimum 2 MB.
      </p>
    </div>
  );
} 