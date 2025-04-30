'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Share2, 
  Copy, 
  Mail, 
  Facebook, 
  Twitter, 
  MessageCircle 
} from 'lucide-react';
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  url?: string;
}

export default function ShareButton({ title, url }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Paylaşılacak URL - eğer url parametresi yoksa mevcut sayfayı kullan
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  
  // URL'i panoya kopyala
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Bağlantı panoya kopyalandı');
      setIsOpen(false);
    } catch (error) {
      toast.error('Bağlantı kopyalanırken bir hata oluştu');
      console.error('Kopyalama hatası:', error);
    }
  };
  
  // Farklı platformlarda paylaşım için URL'leri oluştur
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${shareUrl}`)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title} ${shareUrl}`)}`
  };
  
  // Harici bir sayfada paylaşım sitesini aç
  const shareExternally = (platform: keyof typeof shareUrls) => {
    window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    
    // API çağrısı yapılmayacak - bu fonksiyon sadece kullanıcı deneyimi için çalışacak
    // NOT: İleride istatistik özelliği eklendiğinde buraya API çağrısı eklenebilir
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          size="sm"
          className="flex items-center h-9 sm:h-10 px-3 sm:px-4 space-x-1.5 sm:space-x-2 rounded-full hover:bg-primary/10 active:scale-95 transition-all text-foreground border-border"
        >
          <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm font-medium hidden sm:inline-block">Paylaş</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 p-1.5">
        <DropdownMenuItem 
          onClick={copyToClipboard}
          className="cursor-pointer h-9 sm:h-10 px-3 flex items-center text-xs sm:text-sm hover:bg-secondary rounded-md"
        >
          <Copy className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Bağlantıyı kopyala</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => shareExternally('whatsapp')}
          className="cursor-pointer h-9 sm:h-10 px-3 flex items-center text-xs sm:text-sm hover:bg-secondary rounded-md"
        >
          <MessageCircle className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
          <span>WhatsApp ile paylaş</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => shareExternally('facebook')}
          className="cursor-pointer h-9 sm:h-10 px-3 flex items-center text-xs sm:text-sm hover:bg-secondary rounded-md"
        >
          <Facebook className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
          <span>Facebook&apos;ta paylaş</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => shareExternally('twitter')}
          className="cursor-pointer h-9 sm:h-10 px-3 flex items-center text-xs sm:text-sm hover:bg-secondary rounded-md"
        >
          <Twitter className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-500" />
          <span>X&apos;te paylaş</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => shareExternally('email')}
          className="cursor-pointer h-9 sm:h-10 px-3 flex items-center text-xs sm:text-sm hover:bg-secondary rounded-md"
        >
          <Mail className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>E-posta ile gönder</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 