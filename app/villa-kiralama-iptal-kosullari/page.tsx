"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Image from "next/image";
import iptalKosullariData from "./iptal-kosullari.json";

export default function IptalKosullariPage() {
  const [language, setLanguage] = useState<"tr" | "en">("tr");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // JSON'dan bölümleri render etme
  const renderSections = () => {
    return iptalKosullariData.sections.map((section, sectionIndex) => (
      <Card
        key={section.id}
        className="mb-8 border-0 bg-white shadow-md hover:shadow-xl transition-all duration-700 ease-out hover:-translate-y-1"
        style={{ transitionDelay: `${(sectionIndex + 2) * 100}ms` }}
      >
        <CardHeader className="border-b border-gray-50 bg-gray-50/50">
          <CardTitle className="text-xl md:text-2xl font-semibold text-primary">
            {section.title[language]}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{section.content[language]}</p>
          </div>
        </CardContent>
      </Card>
    ));
  };

  // Sık sorulan soruları render etme
  const renderFaq = () => {
    return (
      <Card 
        className={`mt-12 border-0 bg-white shadow-md transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        style={{ transitionDelay: `${(iptalKosullariData.sections.length + 3) * 100}ms` }}
      >
        <CardHeader className="border-b border-gray-50 bg-gray-50/50">
          <CardTitle className="text-2xl font-semibold text-primary">
            {language === "tr" ? "Sık Sorulan Sorular" : "Frequently Asked Questions"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <Accordion type="single" collapsible className="w-full">
            {iptalKosullariData.faq.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-medium text-left py-4">
                  {item.question[language]}
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 text-gray-700">
                  {item.answer[language]}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    );
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
      <Card className={`mb-12 border-0 bg-white shadow-lg overflow-hidden transition-all duration-700 ease-out hover:shadow-xl hover:-translate-y-1 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms' }}>
        <div className="relative p-8 md:p-12">
          <CardHeader className="text-center p-0 mb-6">
            <CardTitle className="text-3xl md:text-4xl font-bold text-primary">
              {iptalKosullariData.title[language]}
            </CardTitle>
          </CardHeader>
        </div>
      </Card>

      {/* Ana içerik */}
      <div className={`grid grid-cols-1 gap-8 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '400ms' }}>
        {/* Bölümler */}
        {renderSections()}

        {/* SSS */}
        {renderFaq()}

        {/* İletişim Kartı */}
        <Card 
          className={`mt-8 border-0 bg-primary/5 shadow-md hover:shadow-xl transition-all duration-700 ease-out hover:-translate-y-1 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
          style={{ transitionDelay: `${(iptalKosullariData.sections.length + 4) * 100}ms` }}
        >
          <CardContent className="p-6 md:p-8">
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                {language === "tr" ? "Daha Fazla Bilgi Mi Gerekiyor?" : "Need More Information?"}
              </h3>
              <p>
                {language === "tr" 
                  ? "İptal koşulları hakkında daha detaylı bilgi almak için müşteri hizmetlerimizle iletişime geçebilirsiniz."
                  : "Contact our customer service for more detailed information about cancellation conditions."}
              </p>
              <div className="mt-4">
                <a 
                  href="/villa-kiralama-iletisim" 
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors duration-300"
                >
                  <span>
                    {language === "tr" ? "İletişime Geç" : "Contact Us"}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Telif Hakkı Bilgisi */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Inn Elegance Villa. {language === "tr" ? "Tüm hakları saklıdır." : "All rights reserved."}</p>
        </div>
      </div>
    </div>
  );
}
