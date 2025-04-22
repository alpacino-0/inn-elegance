"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { RectangleGoggles, Facebook, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SocialLoginProps {
  mode?: 'signin' | 'signup';
  redirectUrl?: string;
  className?: string;
}

export default function SocialLogin({
  mode = 'signin',
  redirectUrl = '/auth/callback',
  className = ''
}: SocialLoginProps) {
  const [isLoading, setIsLoading] = useState<{
    google: boolean;
    facebook: boolean;
    github: boolean;
  }>({
    google: false,
    facebook: false,
    github: false
  });
  
  const supabase = createClient();
  
  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'github') => {
    try {
      setIsLoading(prev => ({ ...prev, [provider]: true }));
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${redirectUrl}`,
        }
      });
      
      if (error) {
        console.error(`${provider} ile giriş yapılırken hata oluştu:`, error.message);
        throw error;
      }
    } catch (error) {
      console.error(`${provider} ile giriş yapılırken hata oluştu:`, error);
    } finally {
      setIsLoading(prev => ({ ...prev, [provider]: false }));
    }
  };
  
  return (
    <div className={`flex flex-col w-full gap-2 ${className}`}>
      <div className="flex items-center my-3">
        <Separator className="flex-grow" />
        <span className="mx-2 text-xs text-muted-foreground">
          {mode === 'signin' ? 'Şunlarla giriş yapın' : 'Şunlarla kaydolun'}
        </span>
        <Separator className="flex-grow" />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => handleSocialLogin('google')}
          disabled={isLoading.google}
        >
          <RectangleGoggles className="w-4 h-4" />
          <span className="whitespace-nowrap">
            {isLoading.google ? 'İşleniyor...' : 'Google'}
          </span>
        </Button>
        
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => handleSocialLogin('facebook')}
          disabled={isLoading.facebook}
        >
          <Facebook className="w-4 h-4" />
          <span className="whitespace-nowrap">
            {isLoading.facebook ? 'İşleniyor...' : 'Facebook'}
          </span>
        </Button>
        
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => handleSocialLogin('github')}
          disabled={isLoading.github}
        >
          <Github className="w-4 h-4" />
          <span className="whitespace-nowrap">
            {isLoading.github ? 'İşleniyor...' : 'GitHub'}
          </span>
        </Button>
      </div>
    </div>
  );
} 