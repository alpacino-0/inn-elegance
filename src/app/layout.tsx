import { Nunito, Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"]
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"]
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full">
      <body
        className={`${nunito.variable} ${montserrat.variable} antialiased min-h-full bg-background font-sans`}
      >
        <AuthProvider>
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
