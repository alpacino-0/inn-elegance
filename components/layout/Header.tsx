"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Building2, Info, Mail, Home, LogIn, UserPlus, UserCircle, Settings, LogOut, ShieldAlert } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { MapIcon } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/user';
import LoginStatus from '@/components/auth/LoginStatus';
import { signOutAction } from '@/app/actions';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter
} from "@/components/ui/sheet";
import ProtectedLink from "@/components/ui/protected-link";

interface HeaderProps {
  user: User | null;
  userProfile: UserProfile | null;
}

const Header = ({ user, userProfile }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const sheetTriggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Menü öğeleri
  const menuItems = [
    { id: 'home', text: 'Ana Sayfa', href: '/', icon: Home, active: pathname === "/" || pathname === "" },
    { id: 'villas', text: 'Villalar', href: '/villa-kiralama', icon: Building2, active: pathname?.includes('/villa-kiralama') },
    { id: 'regions', text: 'Bölgeler', href: '/bolgeler', icon: MapIcon, active: pathname?.includes('/bolgeler') },
    { id: 'about', text: 'Hakkımızda', href: '/villa-kiralama-hakkimizda', icon: Info, active: pathname?.includes('/villa-kiralama-hakkimizda') },
    { id: 'contact', text: 'İletişim', href: '/villa-kiralama-iletisim', icon: Mail, active: pathname?.includes('/villa-kiralama-iletisim') },
  ];

  // Scroll durumunu kontrol et - useCallback ile optimize
  const handleScroll = useCallback(() => {
    if (typeof window !== 'undefined') {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    }
  }, []);

  // Scroll event listener - passive: true ile performans artışı
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Başlangıçta kontrol et
      
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Sheet durumu değiştiğinde vücut scroll kilidi
  useEffect(() => {
    // body scroll locking için daha iyi bir yaklaşım
    if (isSheetOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      // Sayfanın kaymasını önle
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      // Önceki scroll pozisyonunu geri yükle
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      
      if (scrollY) {
        window.scrollTo(0, Number.parseInt(scrollY || '0', 10) * -1);
      }
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [isSheetOpen]);

  // Sheet açıldığında ilk menü öğesine odak
  useEffect(() => {
    if (isSheetOpen) {
      // İlk menü öğesini bul
      const firstMenuItem = document.querySelector('[data-first-menu-item="true"]') as HTMLElement;
      if (firstMenuItem) {
        setTimeout(() => {
          firstMenuItem.focus();
        }, 100);
      }
    } else {
      // Sheet kapandığında menu butonuna odak
      if (sheetTriggerRef.current) {
        sheetTriggerRef.current.focus();
      }
    }
  }, [isSheetOpen]);

  return (
    <header 
      ref={headerRef}
      className={`sticky top-0 z-50 transition-all duration-300
                 ${isScrolled 
                   ? 'shadow-md py-1 backdrop-blur-sm bg-background/95 border-b border-border/60' 
                   : 'py-2 bg-background border-b border-border'}`}
    >
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="relative z-10 group transition-all duration-300 flex items-center outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-md"
            aria-label="Ana Sayfa"
          >
            <div className="h-10 md:h-12 w-auto relative flex items-center justify-center">
              <Image
                src="/logo-siyah.svg"
                alt="Inn Elegance"
                width={150}
                height={45}
                className={`transition-all duration-300 transform ${isScrolled ? 'scale-95' : 'group-hover:scale-105'}`}
                style={{ width: 'auto', height: isScrolled ? '35px' : '45px' }}
                priority
              />
            </div>
          </Link>

          {/* Masaüstü Navigasyon */}
          <div className="hidden md:flex items-center justify-between flex-1 ml-8">
            <nav className="flex items-center space-x-6" aria-label="Ana navigasyon">
              {/* Menü Linkleri */}
              {menuItems.map((item) => (
                <Link 
                  key={item.id}
                  href={item.href}
                  className={`relative transition-all duration-300 group text-sm font-medium
                            hover:text-accent outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-md px-2 py-1
                            ${item.active ? 'text-accent' : 'text-foreground'}`}
                  aria-current={item.active ? 'page' : undefined}
                >
                  {item.text}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-current transition-all duration-300 
                                  ${item.active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              ))}
            </nav>
            
            {/* Login Status */}
            <LoginStatus user={user} userProfile={userProfile} className="ml-4" />
          </div>

          {/* Mobil Menü Butonu - Sheet Trigger ile */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <div className="md:hidden flex items-center ml-auto">
              {/* Mobil Login Status - sadece butonları göster */}
              {!user ? (
                <Link 
                  href="/sign-in" 
                  className="text-sm font-medium mr-2 p-1.5 rounded-md hover:bg-muted transition-colors duration-200"
                  aria-label="Giriş Yap"
                >
                  <LogIn className="w-5 h-5" />
                </Link>
              ) : (
                <div className="flex items-center mr-2">
                  <Link
                    href="/protected/profile"
                    className="p-1.5 rounded-md hover:bg-muted transition-colors duration-200"
                    aria-label="Profil"
                  >
                    {userProfile?.avatar ? (
                      <Image 
                        src={userProfile.avatar} 
                        alt={userProfile.name || 'Kullanıcı'} 
                        width={20} 
                        height={20} 
                        className="w-5 h-5 rounded-full object-cover" 
                      />
                    ) : (
                      <UserCircle className="w-5 h-5" />
                    )}
                  </Link>
                </div>
              )}
              
              <SheetTrigger asChild>
                <button
                  type="button"
                  ref={sheetTriggerRef}
                  className="p-2 rounded-md hover:bg-muted transition-colors duration-300 active:scale-95 touch-manipulation
                             outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  aria-label="Menüyü Aç"
                  aria-haspopup="dialog"
                  aria-expanded={isSheetOpen}
                >
                  <Menu className="w-5 h-5 text-foreground transition-transform duration-300" />
                </button>
              </SheetTrigger>
            </div>
            
            <SheetContent 
              side="right" 
              className="p-0 bg-background border-l border-border w-full sm:w-80 outline-none focus:outline-none"
              onOpenAutoFocus={(e) => e.preventDefault()} // Otomatik odaklanmayı devre dışı bırak (kendi odaklanma stratejimizi kullanıyoruz)
            >
              <SheetHeader className="p-4 border-b border-border">
                <SheetTitle className="text-lg font-medium text-foreground flex justify-start">
                  <Image
                    src="/logo-siyah.svg"
                    alt="Inn Elegance"
                    width={120}
                    height={35}
                    style={{ width: 'auto', height: '35px' }}
                    priority
                  />
                </SheetTitle>
              </SheetHeader>
              
              {/* Mobil oturum durumu bilgisi */}
              {user && (
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center">
                    {userProfile?.avatar ? (
                      <Image 
                        src={userProfile.avatar} 
                        alt={userProfile.name || 'Kullanıcı'} 
                        width={32} 
                        height={32} 
                        className="w-8 h-8 rounded-full mr-3 object-cover" 
                      />
                    ) : (
                      <UserCircle className="w-8 h-8 mr-3 text-foreground" />
                    )}
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">{userProfile?.name || user.email?.split('@')[0]}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {userProfile?.role === 'ADMIN' && (
                      <span className="ml-auto px-1.5 py-0.5 bg-accent/20 text-accent-foreground/80 text-xs font-semibold rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col p-4 overflow-y-auto">
                <nav className="flex flex-col space-y-1" aria-label="Mobil navigasyon">
                  {menuItems.map((item, index) => (
                    <SheetClose asChild key={item.id}>
                      <Link
                        href={item.href}
                        className={`flex items-center text-base font-medium px-3 py-3 rounded-lg transition-all duration-200 ease-in-out
                                  outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
                                  touch-manipulation active:scale-[0.98] select-none
                                  ${item.active 
                                    ? 'bg-muted text-accent' 
                                    : 'hover:bg-muted/50 hover:text-accent'}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                        aria-current={item.active ? 'page' : undefined}
                        data-first-menu-item={index === 0 ? "true" : undefined}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.text}
                      </Link>
                    </SheetClose>
                  ))}
                  
                  {/* Oturum işlemleri menü öğeleri */}
                  {!user ? (
                    <>
                      <div className="h-px my-2 bg-border" />
                      <SheetClose asChild>
                        <Link
                          href="/sign-in"
                          className="flex items-center text-base font-medium px-3 py-3 rounded-lg transition-all duration-200 hover:bg-muted/50"
                        >
                          <LogIn className="w-5 h-5 mr-3" />
                          Giriş Yap
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/sign-up"
                          className="flex items-center text-base font-medium px-3 py-3 rounded-lg transition-all duration-200 bg-accent text-accent-foreground"
                        >
                          <UserPlus className="w-5 h-5 mr-3" />
                          Kaydol
                        </Link>
                      </SheetClose>
                    </>
                  ) : (
                    <>
                      <div className="h-px my-2 bg-border" />
                      
                      <SheetClose asChild>
                        <Link
                          href="/protected/profile"
                          className="flex items-center text-base font-medium px-3 py-3 rounded-lg transition-all duration-200 hover:bg-muted/50"
                        >
                          <UserCircle className="w-5 h-5 mr-3" />
                          Profilim
                        </Link>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Link
                          href="/protected/settings"
                          className="flex items-center text-base font-medium px-3 py-3 rounded-lg transition-all duration-200 hover:bg-muted/50"
                        >
                          <Settings className="w-5 h-5 mr-3" />
                          Ayarlar
                        </Link>
                      </SheetClose>
                      
                      {userProfile?.role === 'ADMIN' && (
                        <SheetClose asChild>
                          <ProtectedLink
                            href="/protected/admin"
                            userProfile={userProfile}
                            requiredRole="ADMIN"
                            className="flex items-center text-base font-medium px-3 py-3 rounded-lg transition-all duration-200 hover:bg-muted/50"
                          >
                            <ShieldAlert className="w-5 h-5 mr-3" />
                            Admin Paneli
                          </ProtectedLink>
                        </SheetClose>
                      )}
                      
                      <button
                        onClick={async () => {
                          setIsSheetOpen(false);
                          await signOutAction();
                        }}
                        className="flex items-center text-base font-medium px-3 py-3 rounded-lg transition-all duration-200 hover:bg-destructive/10 text-destructive text-left"
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        Çıkış Yap
                      </button>
                    </>
                  )}
                </nav>
              </div>
              
              <SheetFooter className="p-4 mt-auto border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  © {new Date().getFullYear()} Inn Elegance
                </p>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header; 