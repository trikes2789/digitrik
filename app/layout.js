import { Inter } from "next/font/google";
import "./globals.css";
// Importiamo le librerie ufficiali di Google
import { GoogleAnalytics, GoogleAdSense } from '@next/third-parties/google';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Digitrik Pro - Suite PDF Online",
  description: "Digitrik Pro - Converti, Unisci e Modifica PDF Online Gratis. Gestisci i tuoi documenti in sicurezza direttamente dal browser.",
  keywords: ["pdf", "convertitore pdf", "unire pdf", "watermark", "online", "gratis", "privacy"],
  authors: [{ name: "Digitrik Team" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className={inter.className}>
        {children}
      </body>
      
      {/* 1. Il tuo Google Analytics (GA4) */}
      <GoogleAnalytics gaId="G-8PCSJNMV8E" />

      {/* 2. Il tuo Google AdSense */}
      <GoogleAdSense publisherId="pub-7585223971066548" />
    </html>
  );
}