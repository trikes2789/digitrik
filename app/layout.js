import './globals.css'

export const metadata = {
  title: 'Digitrik Workstation',
  description: 'Gestione documenti professionale',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
