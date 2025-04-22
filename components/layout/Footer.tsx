'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Mail, Phone } from 'lucide-react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Client-side-only kodu çalıştırmak için
  useEffect(() => {
    setIsClient(true);
  }, []);

  // IntersectionObserver için ayrı bir useEffect
  useEffect(() => {
    if (!isClient) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.1 }
    );
    
    const footerElement = document.querySelector('footer');
    if (footerElement) {
      observer.observe(footerElement);
    }
    
    return () => {
      if (footerElement) {
        observer.unobserve(footerElement);
      }
    };
  }, [isClient]);

  // Sosyal medya linkleri
  const socialLinks = [
    { icon: Facebook, url: 'https://facebook.com/innelegance', label: 'Facebook', id: "facebook" },
    { icon: Instagram, url: 'https://instagram.com/innelegance', label: 'Instagram', id: "instagram" },
    { icon: Twitter, url: 'https://twitter.com/innelegance', label: 'Twitter', id: "twitter" },
    { icon: Linkedin, url: 'https://linkedin.com/company/innelegance', label: 'LinkedIn', id: "linkedin" },
    { icon: Youtube, url: 'https://youtube.com/innelegance', label: 'Youtube', id: "youtube" }
  ];

  // Mobil görünüm için bölüm açılır/kapanır durumu
  const [openSections, setOpenSections] = useState<{[key: string]: boolean}>({
    quickLinks: false,
    legal: false
  });

  // Mobil görünümde bölüm açma/kapama işlevi
  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <footer className={`bg-primary pt-10 pb-6 px-4 md:px-6 
                       ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Şirket Bilgileri */}
          <div className={`${isVisible ? 'animate-slide-up animate-delay-100' : ''}`}>
            <div className="mb-4">
              <div className="h-10 w-auto relative mb-2">
                <Image
                  src="/logo-beyaz.svg"
                  alt="Inn Elegance"
                  width={160}
                  height={40}
                  className="transition-all duration-300 hover:scale-105"
                  style={{ width: 'auto', height: 'auto', maxWidth: '160px' }}
                  priority
                />
              </div>
              <p className="text-sm font-light mt-2 text-white">Tatilin Lüks Yüzü</p>
            </div>
            <p className="text-white text-sm mb-5 leading-relaxed">Lüks villalar ve tatil evleri için güvenilir adresiniz.</p>
            <div className="space-y-2">
              <div className="flex items-center text-sm group">
                <Phone size={16} className="mr-2 text-white group-hover:text-white transition-colors" />
                <span className="text-white">+90 531 621 6100</span>
              </div>
              <div className="flex items-center text-sm group">
                <Mail size={16} className="mr-2 text-white group-hover:text-white transition-colors" />
                <span className="text-white">info@innelegance.com</span>
              </div>
              <div className="flex items-start text-sm group">
                <MapPin size={16} className="mr-2 mt-1 text-white group-hover:text-white transition-colors" />
                <span className="text-white">123 Villa Sokak, Lüks Mahallesi, 34000 İstanbul, Türkiye</span>
              </div>
            </div>
            
            {/* Sosyal Medya */}
            <div className="flex space-x-3 mt-5">
              {socialLinks.map((link, index) => (
                <a 
                  key={link.id}
                  href={link.url} 
                  className={`w-8 h-8 flex items-center justify-center rounded-full 
                             bg-white/10 hover:bg-white/20 transition-all duration-300 
                             hover:scale-110 
                             ${isVisible ? `animate-slide-right animate-delay-${(index + 1) * 100}` : ''}`}
                  aria-label={link.label}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <link.icon size={16} className="text-white" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Hızlı Linkler */}
          <div className={`${isVisible ? 'animate-slide-up animate-delay-200' : ''}`}>
            <button 
              className="flex justify-between items-center w-full text-left mb-4 cursor-pointer md:cursor-default bg-transparent border-none"
              onClick={() => toggleSection('quickLinks')}
              aria-expanded={openSections.quickLinks}
              type="button"
            >
              <div className="text-lg font-medium text-white leading-tight">Hızlı Bağlantılar</div>
              <span className="md:hidden text-white">
                {openSections.quickLinks ? '−' : '+'}
              </span>
            </button>
            <ul className={`space-y-2 transition-all duration-300 overflow-hidden 
                          ${!openSections.quickLinks ? 'max-h-0 md:max-h-[500px]' : 'max-h-[500px]'}`}>
              {[
                { text: 'Ana Sayfa', href: '/', id: 'home' },
                { text: 'Villalar', href: '/villa-kiralama', id: 'villas' },
                { text: 'Bölgeler', href: '/villa-kiralama-bolgeleri', id: 'locations' },
                { text: 'Hakkımızda', href: '/villa-kiralama-hakkimizda', id: 'about' },
                { text: 'İletişim', href: '/villa-kiralama-iletisim', id: 'contact' }
              ].map((item) => (
                <li key={item.id} className="group hover:translate-x-1 transition-all duration-200 ease-in-out">
                  <Link href={item.href} className="flex items-center group">
                    <span className="text-white">{item.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Yasal */}
          <div className={`${isVisible ? 'animate-slide-up animate-delay-300' : ''}`}>
            <button 
              className="flex justify-between items-center w-full text-left mb-4 cursor-pointer md:cursor-default bg-transparent border-none"
              onClick={() => toggleSection('legal')}
              aria-expanded={openSections.legal}
              type="button"
            >
              <div className="text-lg font-medium text-white leading-tight">Yasal</div>
              <span className="md:hidden text-white">
                {openSections.legal ? '−' : '+'}
              </span>
            </button>
            <ul className={`space-y-2 transition-all duration-300 overflow-hidden 
                          ${!openSections.legal ? 'max-h-0 md:max-h-[500px]' : 'max-h-[500px]'}`}>
              {[
                { text: 'Gizlilik Şartları', href: '/villa-kiralama-gizlilik-sartlari', id: 'privacy' },
                { text: 'Sıkça Sorulan Sorular', href: '/villa-kiralama-sikca-sorulan-sorular', id: 'faq' },
                { text: 'Ev Sahibi Sözleşmesi', href: '/villa-kiralama-ev-sahibi-sozlesmesi', id: 'host' },
                { text: 'İptal Koşulları', href: '/villa-kiralama-iptal-kosullari', id: 'cancel' },
                { text: 'Villa Kiralama Sözleşmesi', href: '/villa-kiralama-sozlesmesi', id: 'rental' },
                { text: 'KVKK Aydınlatma Metni', href: '/kisisel-verilerin-korunmasi-hakkinda-aydinlatma-metni', id: 'gdpr' }
              ].map((item) => (
                <li key={item.id} className="group hover:translate-x-1 transition-all duration-200 ease-in-out">
                  <Link href={item.href} className="flex items-center group">
                    <span className="text-white">{item.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <Separator className="bg-white/20 my-4" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-white text-sm">
            &copy; {currentYear} Inn Elegance - Tüm hakları saklıdır.
          </p>
          <div className="text-white text-sm mt-2 md:mt-0">
            <span>
              Web Tasarım: <Link href="https://www.linkedin.com/in/orhan-yavuz-18719034a" target="_blank" rel="noopener noreferrer " className="hover:underline transition-colors">Orhan Yavuz</Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 