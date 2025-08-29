import type { Metadata } from "next";
import { Inter, Roboto } from 'next/font/google'
import "./globals.css";

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
})

export const metadata: Metadata = {
  title: "Portail - FIDRA",
  description: "Portail Applicatif Phoenix",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="us">
      <body className={`${inter.variable} ${roboto.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
