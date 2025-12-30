import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script"; // Usiamo solo questo, è nativo e sicuro.

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
      
      {/* --- GOOGLE ANALYTICS (MANUALE) --- */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=G-8PCSJNMV8E`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-8PCSJNMV8E');
        `}
      </Script>

      {/* --- GOOGLE ADSENSE (MANUALE) --- */}
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