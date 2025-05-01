"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button"; 
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import kvkkData from "./kvkk.json";

export default function KVKKPage() {
  const [language, setLanguage] = useState<"tr" | "en">("tr");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Giriş paragraflarını render etme fonksiyonu
  const renderIntroduction = () => {
    return kvkkData.introduction.map((item, index) => (
      <div 
        key={`intro-${index}`} 
        className={`mb-6 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        style={{ transitionDelay: `${(index + 2) * 150}ms` }}
      >
        {item.type === "paragraph" && (
          <p className="text-gray-700 leading-relaxed mb-4">
            {item.content[language]}
          </p>
        )}
      </div>
    ));
  };

  // Bölümleri render etme fonksiyonu
  const renderSections = () => {
    return kvkkData.sections.map((section, sectionIndex) => (
      <Card
        key={section.id}
        className={`mb-8 border-0 bg-white shadow-md hover:shadow-xl transition-all duration-700 ease-out hover:-translate-y-1 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ transitionDelay: `${(sectionIndex + kvkkData.introduction.length + 2) * 150}ms` }}
      >
        <CardHeader className="border-b border-gray-50 bg-gray-50/50">
          <CardTitle className="text-xl md:text-2xl font-semibold text-primary">
            {section.title[language]}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="prose prose-lg max-w-none">
            {section.content.map((contentItem, contentIndex) => (
              <div key={`content-${sectionIndex}-${contentIndex}`} className="mb-6 last:mb-0">
                {contentItem.type === "paragraph" && contentItem.text && (
                  <p className="text-gray-700 whitespace-pre-line mb-4">{contentItem.text[language]}</p>
                )}
                
                {contentItem.type === "subpoint" && contentItem.title && (
                  <>
                    <h3 className="text-lg font-medium text-primary mt-6 mb-3">{contentItem.title[language]}</h3>
                    <p className="text-gray-700 mb-4">{contentItem.text[language]}</p>
                  </>
                )}
                
                {contentItem.type === "list" && contentItem.items && (
                  <ul className="space-y-2 list-disc pl-5 mt-4">
                    {contentItem.items.map((item, itemIndex) => (
                      <li key={`item-${sectionIndex}-${contentIndex}-${itemIndex}`} className="text-gray-700">
                        {item[language]}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      {/* Dil Seçici */}
      <div className="flex justify-end mb-4">
        <Tabs 
          value={language} 
          onValueChange={(val) => setLanguage(val as "tr" | "en")}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="tr">Türkçe</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Logo */}
      <div className={`flex justify-center mb-12 transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <div className="relative">
          <Image 
            src="/logo-siyah.svg" 
            alt="Inn Elegance" 
            width={240} 
            height={100}
            className="h-auto"
          />
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-primary rounded-full" />
        </div>
      </div>

      {/* Başlık Kartı */}
      <Card 
        className={`mb-12 border-0 bg-white shadow-lg overflow-hidden transition-all duration-700 ease-out hover:shadow-xl ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} 
        style={{ transitionDelay: '200ms' }}
      >
        <div className="relative p-8 md:p-12">
          <Badge 
            className="absolute top-6 right-6 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            {language === "tr" ? "Resmi Belge" : "Official Document"}
          </Badge>
          <CardHeader className="text-center p-0 mb-6">
            <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
              {kvkkData.title[language]}
            </CardTitle>
          </CardHeader>
        </div>
      </Card>

      {/* Giriş Bölümü */}
      <div 
        className={`mb-12 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ transitionDelay: '300ms' }}
      >
        <h2 className="text-2xl font-semibold text-primary mb-6">
          {language === "tr" ? "Giriş" : "Introduction"}
        </h2>
        {renderIntroduction()}
      </div>

      {/* Ana içerik - Bölümler */}
      <div>
        <h2 className={`text-2xl font-semibold text-primary mb-8 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: '450ms' }}>
          {language === "tr" ? "KVKK Politika Maddeleri" : "KVKK Policy Articles"}
        </h2>
        {renderSections()}
      </div>

      {/* Bilgilendirme Kartı */}
      <Card 
        className={`mt-12 border-0 bg-primary/5 shadow-md hover:shadow-xl transition-all duration-700 ease-out hover:-translate-y-1 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
        style={{ transitionDelay: `${(kvkkData.sections.length + 5) * 150}ms` }}
      >
        <CardContent className="p-6 md:p-8">
          <div className="prose prose-lg max-w-none">
            <h3 className="text-xl font-semibold mb-4 text-primary">
              {language === "tr" ? "İletişim ve Bilgi Talebi" : "Contact and Information Request"}
            </h3>
            <p>
              {language === "tr" 
                ? "Kişisel verilerinizle ilgili daha fazla bilgi almak, haklarınızı kullanmak veya sorularınız için bizimle iletişime geçebilirsiniz."
                : "For more information about your personal data, to exercise your rights, or for any questions, you can contact us."}
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/iletisim">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  {language === "tr" ? "İletişime Geç" : "Contact Us"}
                </Button>
              </Link>
              <Link href="/sss">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  {language === "tr" ? "Sık Sorulan Sorular" : "Frequently Asked Questions"}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ayırıcı ve Bilgilendirme */}
      <div className={`mt-16 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
           style={{ transitionDelay: `${(kvkkData.sections.length + 6) * 150}ms` }}>
        <Separator className="mb-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>
            {language === "tr" 
              ? "Son Güncelleme: 1 Haziran 2023"
              : "Last Updated: June 1, 2023"}
          </p>
          <p>© {new Date().getFullYear()} Inn Elegance LLC. {language === "tr" ? "Tüm hakları saklıdır." : "All rights reserved."}</p>
        </div>
      </div>
    </div>
  );
}
