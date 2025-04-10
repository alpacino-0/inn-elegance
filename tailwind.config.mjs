/** @type {import('tailwindcss').Config} */
import tailwindForms from '@tailwindcss/forms';
import tailwindTypography from '@tailwindcss/typography';

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-nunito)"],
        heading: ["var(--font-montserrat)"],
      },
      colors: {
        // Inn Elegance renk paleti - Marka Kılavuzuna göre düzeltildi
        primary: {
          DEFAULT: "#180675", // Mor - Başlık rengi
          light: "#2a18a6", // Mor tonlarında açık varyant
          dark: "#0c0351", // Mor tonlarında koyu varyant
        },
        secondary: {
          DEFAULT: "#100049", // Koyu Lacivert - Vurgu rengi
          light: "#1a0073", // Koyu Lacivert tonlarında açık varyant
          dark: "#08002b", // Koyu Lacivert tonlarında koyu varyant
        },
        background: "#ffffff", // Beyaz - Arkaplan rengi
        text: "#000000", // Siyah - Ana metin rengi
        
        // Toast bileşenleri için renk grupları
        destructive: {
          DEFAULT: "hsl(0 100% 50%)",
          foreground: "hsl(0 0% 98%)",
        },
        success: {
          DEFAULT: "hsl(142.1 76.2% 36.3%)",
          foreground: "hsl(0 0% 98%)",
        },
        warning: {
          DEFAULT: "hsl(38 92% 50%)",
          foreground: "hsl(0 0% 10%)",
        },
        info: {
          DEFAULT: "hsl(221.2 83.2% 53.3%)",
          foreground: "hsl(210 40% 98%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      textShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.2)',
        DEFAULT: '0 2px 4px rgba(0, 0, 0, 0.2)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.3)',
      },
      // Marka değerlerini yansıtan özel geçişler - Tailwind v4 formatında düzenlendi
      transitionDuration: {
        '400': '400ms',
      },
      boxShadow: {
        // Şunları kaldırdık çünkü Tailwind v4 ile uyumlu değil:
        // 'elegant': '0 10px 15px -3px rgba(24, 6, 117, 0.1), 0 4px 6px -2px rgba(24, 6, 117, 0.05)',
        // 'elegant-lg': '0 20px 25px -5px rgba(24, 6, 117, 0.1), 0 10px 10px -5px rgba(24, 6, 117, 0.04)',
      },
    },
  },
  plugins: [
    tailwindForms,
    tailwindTypography,
    ({ addUtilities }) => {
      const newUtilities = {
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        },
        '.text-shadow-sm': {
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
        },
        '.text-shadow-lg': {
          textShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
        // Marka değerlerine uygun özel yumuşak hover etkisi
        '.hover-rise': {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgba(24, 6, 117, 0.1), 0 4px 6px -2px rgba(24, 6, 117, 0.05)',
          }
        },
      }
      addUtilities(newUtilities)
    },
  ],
} 