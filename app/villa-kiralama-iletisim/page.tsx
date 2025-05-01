"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function IletisimPage() {
  const [language, setLanguage] = useState<"tr" | "en">("tr");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
              {language === "tr" ? "Bize Ulaşın" : "Contact Us"}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none p-0">
            <div className={language === "tr" ? "block" : "hidden"}>
              <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
                Sorularınız veya villa kiralamak için bizimle iletişime geçin. Size en kısa sürede dönüş yapacağız.
              </p>
            </div>
            <div className={language === "en" ? "block" : "hidden"}>
              <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
                Contact us for your questions or to rent a villa. We will get back to you as soon as possible.
              </p>
            </div>
          </CardContent>
        </div>
      </Card>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '400ms' }}>
        <Card className="border-0 bg-white shadow-md h-full hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
          <CardHeader className="border-b border-gray-50">
            <CardTitle className="text-2xl md:text-3xl font-semibold text-primary">
              {language === "tr" ? "İletişim Bilgilerimiz" : "Contact Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className={language === "tr" ? "block" : "hidden"}>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-primary mb-1">Amerika Ofisi:</p>
                    <p className="text-gray-700">7901 4th St N Ste 300, St. Petersburg, FL 33702, USA</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-primary mb-1">Türkiye Ofisi:</p>
                    <p className="text-gray-700">BEZİRGAN MAH. KÖRDERE SK. NO: 673 KAŞ/ ANTALYA</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-primary mb-1">E-posta:</p>
                    <p className="text-gray-700">info@innelegance.com</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="font-medium text-primary mb-1">Telefon:</p>
                    <p className="text-gray-700">+90 (242) 111 22 33</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <div>
                    <p className="font-medium text-primary mb-1">Web sitesi:</p>
                    <p className="text-gray-700">www.innelegance.com</p>
                  </div>
                </li>
              </ul>
              <div className="mt-8 flex justify-center md:justify-start space-x-4">
                <Button
                  variant="outline"
                  className="hover:scale-105 transition-transform duration-300"
                  onClick={() => window.location.href = "mailto:info@innelegance.com"}
                >
                  E-posta Gönder
                </Button>
                <Button 
                  variant="default" 
                  className="hover:scale-105 transition-transform duration-300"
                  onClick={() => window.open("https://www.innelegance.com", "_blank")}
                >
                  Web Sitesi
                </Button>
              </div>
            </div>
            <div className={language === "en" ? "block" : "hidden"}>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-primary mb-1">US Office:</p>
                    <p className="text-gray-700">7901 4th St N Ste 300, St. Petersburg, FL 33702, USA</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-primary mb-1">Turkey Office:</p>
                    <p className="text-gray-700">BEZIRGAN MAH. KORDERE SK. NO: 673 KAS/ ANTALYA</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-primary mb-1">Email:</p>
                    <p className="text-gray-700">info@innelegance.com</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="font-medium text-primary mb-1">Phone:</p>
                    <p className="text-gray-700">+90 (242) 111 22 33</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <div>
                    <p className="font-medium text-primary mb-1">Website:</p>
                    <p className="text-gray-700">www.innelegance.com</p>
                  </div>
                </li>
              </ul>
              <div className="mt-8 flex justify-center md:justify-start space-x-4">
                <Button
                  variant="outline"
                  className="hover:scale-105 transition-transform duration-300"
                  onClick={() => window.location.href = "mailto:info@innelegance.com"}
                >
                  Send Email
                </Button>
                <Button 
                  variant="default" 
                  className="hover:scale-105 transition-transform duration-300"
                  onClick={() => window.open("https://www.innelegance.com", "_blank")}
                >
                  Website
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-md h-full hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
          <CardHeader className="border-b border-gray-50">
            <CardTitle className="text-2xl md:text-3xl font-semibold text-primary">
              {language === "tr" ? "Konum" : "Location"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="w-full h-[400px] rounded-lg overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3217.023104785164!2d29.418955883493815!3d36.26321800125356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14c1d303b9adaee1%3A0x2f6f2bf11015c40e!2sVilla%20Marsilya!5e0!3m2!1str!2str!4v1746134832412!5m2!1str!2str" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Inn Elegance Konum"
                className="rounded-lg"
              />
            </div>
            <div className="mt-4">
              <p className="text-gray-700 text-sm">
                {language === "tr" 
                  ? "Villa Marsilya - BEZİRGAN MAH. KÖRDERE SK. NO: 673 KAŞ/ ANTALYA" 
                  : "Villa Marsilya - BEZIRGAN MAH. KORDERE SK. NO: 673 KAS/ ANTALYA"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={`mb-12 border-0 bg-white shadow-md transition-all duration-700 ease-out hover:shadow-xl hover:-translate-y-2 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-semibold text-primary">
            {language === "tr" ? "Bize Yazın" : "Contact Form"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label htmlFor="name" className="font-medium text-primary mb-2">
                  {language === "tr" ? "Adınız Soyadınız" : "Your Name"}
                </label>
                <input
                  type="text"
                  id="name"
                  className="border border-gray-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder={language === "tr" ? "Adınız Soyadınız" : "Your Name"}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="email" className="font-medium text-primary mb-2">
                  {language === "tr" ? "E-posta Adresiniz" : "Email Address"}
                </label>
                <input
                  type="email"
                  id="email"
                  className="border border-gray-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder={language === "tr" ? "E-posta Adresiniz" : "Email Address"}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <label htmlFor="subject" className="font-medium text-primary mb-2">
                {language === "tr" ? "Konu" : "Subject"}
              </label>
              <input
                type="text"
                id="subject"
                className="border border-gray-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder={language === "tr" ? "Konu" : "Subject"}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="message" className="font-medium text-primary mb-2">
                {language === "tr" ? "Mesajınız" : "Your Message"}
              </label>
              <textarea
                id="message"
                rows={5}
                className="border border-gray-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder={language === "tr" ? "Mesajınız" : "Your Message"}
              />
            </div>
            <div>
              <Button 
                type="submit" 
                className="w-full md:w-auto hover:scale-105 transition-transform duration-300"
              >
                {language === "tr" ? "Gönder" : "Send Message"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}