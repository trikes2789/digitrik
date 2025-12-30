import { Inter } from "next/font/google";
import "./globals.css";
// 1. Importiamo SIA Analytics CHE AdSense
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
      
      {/* 2. Analytics (Sostituisci con il tuo ID che inizia con G-) */}
      <GoogleAnalytics gaId="G-TUO_ID_ANALYTICS" />

      {/* 3. AdSense (Sostituisci con il tuo ID che inizia con pub-) */}
      <GoogleAdSense publisherId="pub-TUO_ID_ADSENSE" />
    </html>
  );
}