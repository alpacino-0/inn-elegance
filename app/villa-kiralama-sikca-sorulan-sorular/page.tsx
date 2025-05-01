"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import faqData from "./faq.json";

interface FAQ {
  question: {
    tr: string;
    en: string;
  };
  answer: {
    tr: string;
    en: string;
  };
}

interface Section {
  id: string;
  title: {
    tr: string;
    en: string;
  };
  faqs: FAQ[];
}

export default function FaqPage() {
  const [language, setLanguage] = useState<"tr" | "en">("tr");
  const [activeSection, setActiveSection] = useState<string | null>("all");
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Filtre fonksiyonu
  const filteredFaqs = (section: Section | FAQ[], type: "section" | "general" = "section") => {
    const items = type === "section" ? (section as Section).faqs : section as FAQ[];
    if (!searchQuery) return items;

    return items.filter((faq: FAQ) => 
      faq.question[language].toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer[language].toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
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

      <Card className={`mb-12 border-0 bg-white shadow-lg overflow-hidden transition-all duration-700 ease-out hover:shadow-xl hover:-translate-y-1 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms' }}>
        <div className="relative p-8 md:p-12">
          <CardHeader className="text-center p-0 mb-6">
            <CardTitle className="text-3xl md:text-4xl font-bold text-primary">
              {faqData.heroTitle[language]}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none p-0">
            <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
              {faqData.heroDescription[language]}
            </p>
            
            <div className="mt-8 relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === "tr" ? "Sorularda ara..." : "Search questions..."}
                className="w-full p-4 pr-12 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </CardContent>
        </div>
      </Card>

      <div className={`mb-8 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '400ms' }}>
        <div className="flex flex-wrap gap-2 md:gap-4 justify-center mb-8">
          <button
            onClick={() => setActiveSection("all")}
            className={`px-4 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
              activeSection === "all"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {language === "tr" ? "Tümü" : "All"}
          </button>
          
          {faqData.sections.map((section: Section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
                activeSection === section.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {section.title[language]}
            </button>
          ))}
          
          <button
            onClick={() => setActiveSection("general")}
            className={`px-4 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
              activeSection === "general"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {language === "tr" ? "Genel Sorular" : "General Questions"}
          </button>
        </div>
        
        {/* Aktif bölüm içeriği */}
        <div className="grid grid-cols-1 gap-6">
          {/* Tüm sorular veya belirli bir kategori */}
          {activeSection === "all" && (
            <>
              {/* Kategori bölümleri */}
              {faqData.sections.map((section: Section) => {
                const filtered = filteredFaqs(section);
                if (filtered.length === 0) return null;
                
                return (
                  <Card key={section.id} className="border-0 bg-white shadow-md hover:shadow-xl transition-all duration-300">
                    <CardHeader className="border-b border-gray-50 bg-gray-50/50">
                      <CardTitle className="text-xl md:text-2xl font-semibold text-primary">
                        {section.title[language]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Accordion type="single" collapsible className="w-full">
                        {filtered.map((faq: FAQ, index: number) => (
                          <AccordionItem key={`${section.id}-${index}`} value={`${section.id}-${index}`}>
                            <AccordionTrigger className="text-left font-medium">
                              {faq.question[language]}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-700">
                              {faq.answer[language]}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
              
              {/* Genel sorular */}
              {(() => {
                const filtered = filteredFaqs(faqData.generalFaqs, "general");
                if (filtered.length === 0) return null;
                
                return (
                  <Card className="border-0 bg-white shadow-md hover:shadow-xl transition-all duration-300">
                    <CardHeader className="border-b border-gray-50 bg-gray-50/50">
                      <CardTitle className="text-xl md:text-2xl font-semibold text-primary">
                        {language === "tr" ? "Genel Sorular" : "General Questions"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Accordion type="single" collapsible className="w-full">
                        {filtered.map((faq: FAQ, index: number) => (
                          <AccordionItem key={`general-${index}`} value={`general-${index}`}>
                            <AccordionTrigger className="text-left font-medium">
                              {faq.question[language]}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-700">
                              {faq.answer[language]}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })()}
            </>
          )}
          
          {/* Belirli bir kategori */}
          {activeSection !== "all" && activeSection !== "general" && (() => {
            const section = faqData.sections.find(s => s.id === activeSection);
            if (!section) return null;
            
            const filtered = filteredFaqs(section);
            if (filtered.length === 0) {
              return (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {language === "tr" ? "Arama sonucu bulunamadı." : "No search results found."}
                  </p>
                </div>
              );
            }
            
            return (
              <Card className="border-0 bg-white shadow-md hover:shadow-xl transition-all duration-300">
                <CardHeader className="border-b border-gray-50 bg-gray-50/50">
                  <CardTitle className="text-xl md:text-2xl font-semibold text-primary">
                    {section.title[language]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <Accordion type="single" collapsible className="w-full">
                    {filtered.map((faq: FAQ, index: number) => (
                      <AccordionItem key={`${section.id}-${index}`} value={`${section.id}-${index}`}>
                        <AccordionTrigger className="text-left font-medium">
                          {faq.question[language]}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700">
                          {faq.answer[language]}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })()}
          
          {/* Genel sorular */}
          {activeSection === "general" && (() => {
            const filtered = filteredFaqs(faqData.generalFaqs, "general");
            if (filtered.length === 0) {
              return (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {language === "tr" ? "Arama sonucu bulunamadı." : "No search results found."}
                  </p>
                </div>
              );
            }
            
            return (
              <Card className="border-0 bg-white shadow-md hover:shadow-xl transition-all duration-300">
                <CardHeader className="border-b border-gray-50 bg-gray-50/50">
                  <CardTitle className="text-xl md:text-2xl font-semibold text-primary">
                    {language === "tr" ? "Genel Sorular" : "General Questions"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <Accordion type="single" collapsible className="w-full">
                    {filtered.map((faq: FAQ, index: number) => (
                      <AccordionItem key={`general-${index}`} value={`general-${index}`}>
                        <AccordionTrigger className="text-left font-medium">
                          {faq.question[language]}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700">
                          {faq.answer[language]}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })()}
          
          {/* Arama sonucu yoksa */}
          {searchQuery && (
            activeSection === "all" ? 
              !faqData.sections.some(section => filteredFaqs(section).length > 0) && 
              filteredFaqs(faqData.generalFaqs, "general").length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {language === "tr" ? "Arama sonucu bulunamadı." : "No search results found."}
                  </p>
                </div>
              )
            : null
          )}
        </div>
      </div>
    </div>
  );
}