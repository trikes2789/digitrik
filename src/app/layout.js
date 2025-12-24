import { Inter } from "next/font/google";
import "./globals.css";
// 1. Importiamo il componente ufficiale per Google Analytics
import { GoogleAnalytics } from '@next/third-parties/google';

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
      
      {/* 2. Componente Google Analytics */}
      {/* SOSTITUISCI 'G-XXXXXXXXXX' CON IL TUO VERO ID (es. G-123456789) */}
      <GoogleAnalytics gaId="G-XXXXXXXXXX" />
    </html>
  );
}