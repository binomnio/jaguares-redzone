// app/layout.tsx
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: "BN Sports RedZone",
  description: "El hogar digital de nuestro equipo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable}`}>
      <body className="font-outfit antialiased">
        {children}
      </body>
    </html>
  );
}