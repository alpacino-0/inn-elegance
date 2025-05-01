"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

export default function HakkimizdaPage() {
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
              {language === "tr" ? "Hakkımızda" : "About Us"}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none p-0">
            <div className={language === "tr" ? "block" : "hidden"}>
              <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
                Inn Elegance LLC, 2021 yılında Florida&apos;da kurulan, lüks villa kiralama sektöründe müşteri odaklı ve yenilikçi bir markadır. Amacımız, misafirlerimize özel bir tatil deneyimi sunmaktır. Akdeniz temalı villalarımızla, lüks ve konforu bir arada sunarak her konuk için unutulmaz bir tatil fırsatı yaratıyoruz.
              </p>
            </div>
            <div className={language === "en" ? "block" : "hidden"}>
              <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
                Inn Elegance LLC was founded in 2021 in Florida, and is an innovative, customer-centric brand in the luxury villa rental sector. Our goal is to offer guests a unique vacation experience. With Mediterranean-themed villas, we combine luxury and comfort to create unforgettable vacation opportunities for every guest.
              </p>
            </div>
          </CardContent>
        </div>
      </Card>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '400ms' }}>
        <Card className="border-0 bg-white shadow-md h-full hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
          <CardHeader className="border-b border-gray-50">
            <CardTitle className="text-2xl md:text-3xl font-semibold text-primary">
              {language === "tr" ? "Neden Bizi Seçmelisiniz?" : "Why Choose Us?"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className={`list-disc pl-6 space-y-4 ${language === "tr" ? "block" : "hidden"}`}>
              <li className="text-lg">
                <span className="font-medium text-primary">Özel Tatil Deneyimi:</span> Biz sadece bir konaklama değil, size özel bir tatil sunuyoruz. Akdeniz&apos;in eşsiz güzelliklerinden ilham alarak her villamızı özenle seçiyoruz.
              </li>
              <li className="text-lg">
                <span className="font-medium text-primary">Kişiye Özel Planlama:</span> Tatilinizi tamamen size göre tasarlıyoruz. İsteklerinize ve ihtiyaçlarınıza uygun özel tatil planları hazırlıyoruz.
              </li>
              <li className="text-lg">
                <span className="font-medium text-primary">Yüksek Konfor ve Kusursuz Hizmet:</span> Tatiliniz boyunca en yüksek konforu sağlamak ve her anınızın özel olmasını sağlamak için çalışıyoruz.
              </li>
              <li className="text-lg">
                <span className="font-medium text-primary">7/24 Destek:</span> Rezervasyon sürecinizden tatilinizin sonuna kadar yanınızdayız. Herhangi bir sorunuz olduğunda, hızlıca çözüm sunuyoruz.
              </li>
            </ul>
            <ul className={`list-disc pl-6 space-y-4 ${language === "en" ? "block" : "hidden"}`}>
              <li className="text-lg">
                <span className="font-medium text-primary">Personalized Vacation Experience:</span> We don&apos;t just provide accommodation; we offer a vacation tailored specifically for you. Drawing inspiration from the unique beauty of the Mediterranean, we carefully select each villa to meet the highest standards.
              </li>
              <li className="text-lg">
                <span className="font-medium text-primary">Custom Holiday Planning:</span> We design vacations based entirely on your preferences. Tailored holiday plans are created to bring your dream vacation to life.
              </li>
              <li className="text-lg">
                <span className="font-medium text-primary">High Comfort & Flawless Service:</span> We strive to ensure the highest level of comfort during your stay and make every moment of your vacation special.
              </li>
              <li className="text-lg">
                <span className="font-medium text-primary">24/7 Support:</span> From the booking process to the end of your stay, we&apos;re always by your side to resolve any questions or concerns you may have.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-md h-full hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
          <CardHeader className="border-b border-gray-50">
            <CardTitle className="text-2xl md:text-3xl font-semibold text-primary">
              {language === "tr" ? "Hizmetlerimiz" : "Our Services"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className={`list-disc pl-6 space-y-4 ${language === "tr" ? "block" : "hidden"}`}>
              <li className="text-lg">
                <span className="font-medium text-primary">Villa Kiralama:</span> Türkiye&apos;nin en güzel tatil beldelerinde ve muazzam manzaralara sahip villalarla, her zevke hitap eden seçenekler sunuyoruz.
              </li>
              <li className="text-lg">
                <span className="font-medium text-primary">Kişiye Özel Tatil Planlaması:</span> Hayalinizdeki tatili gerçeğe dönüştürmek için ihtiyaçlarınıza özel tatil planları oluşturuyoruz.
              </li>
              <li className="text-lg">
                <span className="font-medium text-primary">24/7 Destek:</span> Rezervasyon sürecinden tatilinizin sonuna kadar, her türlü sorunuza hızlıca çözüm buluyoruz.
              </li>
            </ul>
            <ul className={`list-disc pl-6 space-y-4 ${language === "en" ? "block" : "hidden"}`}>
              <li className="text-lg">
                <span className="font-medium text-primary">Villa Rentals:</span> Offering luxury villas in Turkey&apos;s most beautiful holiday destinations, with breathtaking views, catering to all tastes.
              </li>
              <li className="text-lg">
                <span className="font-medium text-primary">Personalized Holiday Planning:</span> We transform your dream vacation into reality with plans designed specifically around your needs.
              </li>
              <li className="text-lg">
                <span className="font-medium text-primary">24/7 Support:</span> We provide continuous assistance from the reservation process to the end of your holiday, quickly addressing any issues.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className={`mb-12 border-0 bg-white shadow-md transition-all duration-700 ease-out hover:shadow-xl hover:-translate-y-2 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-semibold text-primary">
            {language === "tr" ? "Misyonumuz" : "Our Mission"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={language === "tr" ? "block" : "hidden"}>
            <p className="text-lg md:text-xl">
              Amacımız, tatil anlayışını güvenilir, kaliteli ve benzersiz bir deneyime dönüştürmektir. Akdeniz&apos;in doğasını ve kültürünü modern konforla birleştirerek, her anınızı özel kılmayı hedefliyoruz.
            </p>
          </div>
          <div className={language === "en" ? "block" : "hidden"}>
            <p className="text-lg md:text-xl">
              Our mission is to redefine the vacation experience by making it reliable, high-quality, and unique. By combining the beauty and culture of the Mediterranean with modern comfort, we aim to make every moment of your stay special.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className={`border-0 bg-white shadow-lg transition-all duration-700 ease-out hover:shadow-xl hover:-translate-y-2 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '800ms' }}>
        <CardHeader className="border-b border-gray-50">
          <CardTitle className="text-2xl md:text-3xl font-semibold text-primary">
            {language === "tr" ? "Firma Bilgilerimiz" : "Company Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={language === "tr" ? "block" : "hidden"}>
              <ul className="space-y-3">
                <li className="text-lg flex items-start">
                  <span className="font-medium text-primary min-w-36">Şirket Unvanı:</span> 
                  <span>Inn Elegance LLC</span>
                </li>
                <li className="text-lg flex items-start">
                  <span className="font-medium text-primary min-w-36">Adres:</span> 
                  <span>7901 4th St N Ste 300, St. Petersburg, FL 33702, USA</span>
                </li>
                <li className="text-lg flex items-start">
                  <span className="font-medium text-primary min-w-36">Web sitesi:</span> 
                  <span>www.innelegance.com</span>
                </li>
                <li className="text-lg flex items-start">
                  <span className="font-medium text-primary min-w-36">Şirket Sahibi:</span> 
                  <span>Orhan Yavuz</span>
                </li>
                <li className="text-lg flex items-start">
                  <span className="font-medium text-primary min-w-36">İletişim:</span> 
                  <span>info@innelegance.com</span>
                </li>
              </ul>
            </div>
            <div className={language === "en" ? "block" : "hidden"}>
              <ul className="space-y-3">
                <li className="text-lg flex items-start">
                  <span className="font-medium text-primary min-w-36">Company Name:</span> 
                  <span>Inn Elegance LLC</span>
                </li>
                <li className="text-lg flex items-start">
                  <span className="font-medium text-primary min-w-36">Address:</span> 
                  <span>7901 4th St N Ste 300, St. Petersburg, FL 33702, USA</span>
                </li>
                <li className="text-lg flex items-start">
                  <span className="font-medium text-primary min-w-36">Website:</span> 
                  <span>www.innelegance.com</span>
                </li>
                <li className="text-lg flex items-start">
                  <span className="font-medium text-primary min-w-36">Company Owner:</span> 
                  <span>Orhan Yavuz</span>
                </li>
                <li className="text-lg flex items-start">
                  <span className="font-medium text-primary min-w-36">Contact:</span> 
                  <span>info@innelegance.com</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}