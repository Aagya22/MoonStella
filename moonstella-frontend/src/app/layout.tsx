import './global.css'
import type { Metadata } from 'next'
import {Playfair_Display,Montserrat} from 'next/font/google'
import { SnackbarProvider } from '@/context/SnackbarContext'


const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})
export const metadata: Metadata = {
  title: 'Moonstella - Exquisite Artistry, Defined by You',
  description: 'A curated marketplace of high-end jewellery where heritage craftmanship meets contemporary elegance',
}
export default function RootLayout({
    children,
    }: {
    children: React.ReactNode
    }) {
    return (   
        <html lang="en" className={`${playfair.variable} ${montserrat.variable}`}>
      <body className="antialiased overflow-x-hidden bg-white">
        <SnackbarProvider>
          {children}
        </SnackbarProvider>
      </body>
        </html>
    )
}