"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

// Gizlilik politikası içeriği
const privacyPolicyData = {
  heroTitle: {
    tr: "Gizlilik Politikası",
    en: "Privacy Policy"
  },
  heroDescription: {
    tr: "Inn Elegance Villa olarak kişisel gizliliğinize değer veriyoruz. Bu politika, bilgilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.",
    en: "At Inn Elegance Villa, we value your personal privacy. This policy explains how your information is collected, used, and protected."
  },
  introduction: {
    tr: "Inn Elegance Villa web sitesini kullanarak, burada belirtilen gizlilik politikasını kabul etmiş olursunuz. Kişisel verilerinizi korumak önceliğimizdir ve bu belge, verilerinizi nasıl işlediğimizi ve koruduğumuzu detaylandırır.",
    en: "By using the Inn Elegance Villa website, you accept the privacy policy stated here. Protecting your personal data is our priority, and this document details how we process and protect your data."
  },
  sections: [
    {
      id: "collected-data",
      title: {
        tr: "Toplanan Veriler",
        en: "Collected Data"
      },
      content: {
        tr: [
          {
            title: "Kişisel Bilgiler",
            text: "Rezervasyon yaparken adınız, e-posta adresiniz, telefon numaranız, adresiniz gibi kişisel bilgilerinizi toplarız. Bu bilgiler, hizmetlerimizi sağlamak ve yasal yükümlülüklerimizi yerine getirmek için gereklidir."
          },
          {
            title: "Ödeme Bilgileri",
            text: "Ödeme yaparken kredi kartı bilgilerinizi toplarız. Bu bilgiler güvenli bir şekilde işlenir ve sadece ilgili ödeme işlemi için kullanılır. Kart bilgileriniz sistemlerimizde saklanmaz."
          },
          {
            title: "Çerezler ve Takip Teknolojileri",
            text: "Web sitemizi kullanırken çerezler ve benzer teknolojiler aracılığıyla bilgi toplarız. Bu teknolojiler, site kullanımınızı analiz etmek, tercihleri hatırlamak ve size özelleştirilmiş bir deneyim sunmak için kullanılır."
          }
        ],
        en: [
          {
            title: "Personal Information",
            text: "When making a reservation, we collect personal information such as your name, email address, phone number, and address. This information is necessary to provide our services and fulfill our legal obligations."
          },
          {
            title: "Payment Information",
            text: "We collect your credit card information when making payments. This information is processed securely and used only for the relevant payment transaction. Your card details are not stored in our systems."
          },
          {
            title: "Cookies and Tracking Technologies",
            text: "We collect information through cookies and similar technologies when you use our website. These technologies are used to analyze site usage, remember preferences, and provide you with a personalized experience."
          }
        ]
      }
    },
    {
      id: "data-usage",
      title: {
        tr: "Verilerin Kullanımı",
        en: "Data Usage"
      },
      content: {
        tr: [
          {
            title: "Rezervasyon ve Hizmet Sunumu",
            text: "Topladığımız kişisel bilgileri, rezervasyonunuzu yönetmek, villa hizmetlerimizi sunmak ve konaklama sırasında size destek sağlamak için kullanırız."
          },
          {
            title: "İletişim",
            text: "E-posta adresinizi ve telefon numaranızı, rezervasyon onayları, değişiklikler ve önemli bilgileri iletmek için kullanırız. Ayrıca, onay vermeniz halinde size promosyonlar ve teklifler hakkında bilgi verebiliriz."
          },
          {
            title: "Yasal Yükümlülükler",
            text: "Kişisel bilgilerinizi, yasal yükümlülüklerimizi yerine getirmek, haklarımızı korumak veya yasal düzenlemelere uymak için kullanabiliriz."
          }
        ],
        en: [
          {
            title: "Reservation and Service Provision",
            text: "We use the personal information we collect to manage your reservation, provide our villa services, and support you during your stay."
          },
          {
            title: "Communication",
            text: "We use your email address and phone number to communicate reservation confirmations, changes, and important information. Additionally, with your consent, we may inform you about promotions and offers."
          },
          {
            title: "Legal Obligations",
            text: "We may use your personal information to fulfill our legal obligations, protect our rights, or comply with legal regulations."
          }
        ]
      }
    },
    {
      id: "data-sharing",
      title: {
        tr: "Verilerin Paylaşımı",
        en: "Data Sharing"
      },
      content: {
        tr: [
          {
            title: "Servis Sağlayıcılar",
            text: "Kişisel bilgilerinizi, bize hizmet sağlayan güvenilir üçüncü taraflarla (örneğin, ödeme işlemcileri, e-posta hizmet sağlayıcıları) paylaşabiliriz. Bu sağlayıcılar, bilgilerinizi gizli tutmakla ve sadece onlar için belirlediğimiz amaçlar doğrultusunda kullanmakla yükümlüdür."
          },
          {
            title: "Yasal Gereksinimler",
            text: "Yasal bir yükümlülüğe uymak, haklarımızı korumak veya yasaların izin verdiği ya da gerektirdiği durumlarda kişisel bilgilerinizi paylaşabiliriz."
          },
          {
            title: "İş Ortakları",
            text: "Havaalanı transferi, kiralık araba veya etkinlik organizasyonu gibi ek hizmetler talep etmeniz durumunda, bu hizmetleri sağlamak için gerekli bilgilerinizi ilgili iş ortaklarımızla paylaşabiliriz."
          }
        ],
        en: [
          {
            title: "Service Providers",
            text: "We may share your personal information with trusted third parties who provide services to us (e.g., payment processors, email service providers). These providers are obligated to keep your information confidential and use it only for the purposes we have specified for them."
          },
          {
            title: "Legal Requirements",
            text: "We may share your personal information to comply with a legal obligation, protect our rights, or in situations permitted or required by law."
          },
          {
            title: "Business Partners",
            text: "If you request additional services such as airport transfers, car rentals, or event organizations, we may share your necessary information with our relevant business partners to provide these services."
          }
        ]
      }
    },
    {
      id: "data-security",
      title: {
        tr: "Veri Güvenliği",
        en: "Data Security"
      },
      content: {
        tr: [
          {
            title: "Güvenlik Önlemleri",
            text: "Kişisel bilgilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz. Verileriniz şifreleme, güvenlik duvarları ve erişim kontrolü gibi önlemlerle korunmaktadır."
          },
          {
            title: "Veri Saklama",
            text: "Kişisel bilgilerinizi, hizmetlerimizi sunmak ve yasal yükümlülüklerimizi yerine getirmek için gerekli olan süre boyunca saklarız. Bu süre genellikle son rezervasyonunuzdan sonra 5 yıl olmakla birlikte, yasal gereksinimler nedeniyle daha uzun olabilir."
          },
          {
            title: "Veri İhlalleri",
            text: "Bir veri ihlali durumunda, uygulanabilir yasalar uyarınca zamanında bilgilendirileceksiniz ve ihlali çözmek için gerekli adımları atacağız."
          }
        ],
        en: [
          {
            title: "Security Measures",
            text: "We use industry-standard security measures to protect your personal information. Your data is protected by measures such as encryption, firewalls, and access control."
          },
          {
            title: "Data Storage",
            text: "We store your personal information for the period necessary to provide our services and fulfill our legal obligations. This period is generally 5 years after your last reservation, but may be longer due to legal requirements."
          },
          {
            title: "Data Breaches",
            text: "In the event of a data breach, you will be informed in a timely manner in accordance with applicable laws, and we will take the necessary steps to resolve the breach."
          }
        ]
      }
    },
    {
      id: "your-rights",
      title: {
        tr: "Haklarınız",
        en: "Your Rights"
      },
      content: {
        tr: [
          {
            title: "Erişim ve Düzeltme",
            text: "Kişisel bilgilerinize erişme ve yanlış bilgileri düzeltme hakkına sahipsiniz. Bu talepleriniz için bizimle iletişime geçebilirsiniz."
          },
          {
            title: "Veri Taşınabilirliği",
            text: "Bize sağladığınız kişisel bilgileri yapılandırılmış, yaygın olarak kullanılan ve makine tarafından okunabilir bir formatta alma hakkına sahipsiniz."
          },
          {
            title: "Silme ve Unutulma Hakkı",
            text: "Belirli koşullar altında, kişisel bilgilerinizin silinmesini talep etme hakkına sahipsiniz. Ancak, yasal yükümlülüklerimiz nedeniyle bazı verileri saklamak zorunda olabiliriz."
          }
        ],
        en: [
          {
            title: "Access and Correction",
            text: "You have the right to access your personal information and correct any incorrect information. You can contact us for these requests."
          },
          {
            title: "Data Portability",
            text: "You have the right to receive the personal information you have provided to us in a structured, commonly used, and machine-readable format."
          },
          {
            title: "Deletion and Right to be Forgotten",
            text: "Under certain conditions, you have the right to request the deletion of your personal information. However, we may need to retain some data due to our legal obligations."
          }
        ]
      }
    }
  ],
  lastUpdate: {
    tr: "Bu gizlilik politikası en son 1 Haziran 2023 tarihinde güncellenmiştir.",
    en: "This privacy policy was last updated on June 1, 2023."
  }
};

export default function GizlilikSartlariPage() {
  const [language, setLanguage] = useState<"tr" | "en">("tr");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // JSON verisinden içerikleri alıp Türkçe/İngilizce olarak render edeceğiz
  const renderSections = () => {
    return privacyPolicyData.sections.map((section, sectionIndex) => (
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
            {section.content[language].map((paragraph, idx) => (
              <div key={idx} className="mb-4">
                <h3 className="text-lg font-medium mb-2">{paragraph.title}</h3>
                <p className="text-gray-700">{paragraph.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ));
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
              {privacyPolicyData.heroTitle[language]}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none p-0">
            <p className="text-lg md:text-xl text-center max-w-3xl mx-auto">
              {privacyPolicyData.heroDescription[language]}
            </p>
          </CardContent>
        </div>
      </Card>

      <div className={`grid grid-cols-1 gap-8 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '400ms' }}>
        {/* Giriş bölümü */}
        <Card className="border-0 bg-white shadow-md hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 md:p-8 prose prose-lg max-w-none">
            <p>{privacyPolicyData.introduction[language]}</p>
          </CardContent>
        </Card>

        {/* Ana bölümler */}
        {renderSections()}

        {/* Son bölüm */}
        <Card 
          className={`border-0 bg-white shadow-md hover:shadow-xl transition-all duration-700 ease-out hover:-translate-y-1 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
          style={{ transitionDelay: `${(privacyPolicyData.sections.length + 2) * 100}ms` }}
        >
          <CardContent className="p-6 md:p-8">
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-semibold mb-4">
                {language === "tr" ? "Son Güncelleme Tarihi" : "Last Update Date"}
              </h3>
              <p className="text-gray-700">
                {privacyPolicyData.lastUpdate[language]}
              </p>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 italic">
                  {language === "tr" 
                    ? "Bu gizlilik politikası, Inn Elegance Villa tarafından hazırlanmıştır ve tüm hakları saklıdır."
                    : "This privacy policy has been prepared by Inn Elegance Villa and all rights are reserved."}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  © {new Date().getFullYear()} Inn Elegance Villa
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* İletişim kartı */}
        <Card 
          className={`mt-4 border-0 bg-primary/5 shadow-md hover:shadow-xl transition-all duration-700 ease-out hover:-translate-y-1 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
          style={{ transitionDelay: `${(privacyPolicyData.sections.length + 3) * 100}ms` }}
        >
          <CardContent className="p-6 md:p-8">
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                {language === "tr" ? "Sorularınız mı var?" : "Do you have questions?"}
              </h3>
              <p>
                {language === "tr" 
                  ? "Gizlilik politikamız hakkında sorularınız varsa, lütfen bizimle iletişime geçmekten çekinmeyin."
                  : "If you have questions about our privacy policy, please don't hesitate to contact us."}
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
      </div>
    </div>
  );
}