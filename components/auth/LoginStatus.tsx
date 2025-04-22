"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@supabase/supabase-js';
import { LogIn, LogOut, UserCircle, User as UserIcon, Settings, ChevronDown, Bell, ShieldAlert } from 'lucide-react';
import { signOutAction } from '@/app/actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type UserProfile } from '@/types/user';
import ProtectedLink from "@/components/ui/protected-link";

interface LoginStatusProps {
  user: User | null;
  userProfile: UserProfile | null;
  className?: string;
}

export default function LoginStatus({ user, userProfile, className = '' }: LoginStatusProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOutAction();
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Link 
          href="/sign-in" 
          className="text-sm font-medium px-3 py-1.5 rounded-md hover:bg-muted transition-colors duration-200 flex items-center"
          aria-label="Giriş Yap"
        >
          <LogIn className="w-4 h-4 mr-1.5" />
          <span>Giriş Yap</span>
        </Link>
        <Link 
          href="/sign-up" 
          className="text-sm font-medium px-3 py-1.5 rounded-md bg-accent text-accent-foreground hover:bg-accent/90 transition-colors duration-200"
          aria-label="Kaydol"
        >
          Kaydol
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button 
            className="flex items-center space-x-1 text-sm font-medium px-2 py-1.5 rounded-md hover:bg-muted transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2" 
            aria-label="Kullanıcı menüsü"
          >
            {userProfile?.avatar ? (
              <Image 
                src={userProfile.avatar} 
                alt={userProfile.name || 'Kullanıcı'} 
                width={24} 
                height={24} 
                className="w-6 h-6 rounded-full mr-2 object-cover" 
              />
            ) : (
              <UserCircle className="w-5 h-5 mr-1.5" />
            )}
            <span className="max-w-[100px] truncate">
              {userProfile?.name || user.email?.split('@')[0]}
            </span>
            {userProfile?.role === 'ADMIN' && (
              <span className="ml-1 px-1.5 py-0.5 bg-accent/20 text-accent-foreground/80 text-xs font-semibold rounded-full">
                Admin
              </span>
            )}
            <ChevronDown className="w-4 h-4 opacity-70 ml-1" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{userProfile?.name || 'Kullanıcı'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <Link href="/protected/profile" className="cursor-pointer">
              <UserIcon className="w-4 h-4 mr-2" />
              Profilim
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/protected/settings" className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              Ayarlar
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href="/protected/notifications" className="cursor-pointer">
              <Bell className="w-4 h-4 mr-2" />
              Bildirimler
              {(userProfile?.notificationPrefs?.unread ?? 0) > 0 && (
                <span className="ml-auto bg-accent text-accent-foreground rounded-full text-xs px-2 py-0.5">
                  {userProfile?.notificationPrefs?.unread}
                </span>
              )}
            </Link>
          </DropdownMenuItem>
          
          {userProfile?.role === 'ADMIN' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <ProtectedLink 
                  href="/protected/admin" 
                  userProfile={userProfile}
                  requiredRole="ADMIN"
                  className="cursor-pointer flex items-center w-full"
                >
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Admin Paneli
                </ProtectedLink>
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleLogout} 
            disabled={isLoggingOut}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoggingOut ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 