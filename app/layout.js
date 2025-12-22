import './globals.css'

export const metadata = {
  title: 'DigitrikPRO Workstation',
  description: 'Converti, Unisci e Modifica PDF Online Gratis',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
