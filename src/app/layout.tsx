import type { Metadata } from "next";
import {
  Fraunces,
  Instrument_Sans,
  JetBrains_Mono,
  Montserrat,
} from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Electronic Lake — Celulares importados",
  description:
    "Catálogo editorial de celulares con garantía y atención humana. Coordinación por WhatsApp.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Electronic Lake — Celulares importados",
    description:
      "Catálogo editorial de celulares con garantía y atención humana.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-AR"
      className={`${fraunces.variable} ${instrument.variable} ${jetbrains.variable} ${montserrat.variable}`}
    >
      <body className="min-h-dvh bg-paper text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
