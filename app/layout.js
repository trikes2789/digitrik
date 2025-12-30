import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script"; // 1. Importiamo lo strumento Script nativo
import { GoogleAnalytics } from '@next/third-parties/google'; // Teniamo Analytics che di solito funziona

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
      
      {/* Analytics (Funziona bene con la libreria) */}
      <GoogleAnalytics gaId="G-8PCSJNMV8E" />

      {/* AdSense (Metodo Manuale "Bulletproof") */}
      <Script
        id="adsense-init"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7585223971066548"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </html>
  );
}