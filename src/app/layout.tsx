import type { Metadata, Viewport } from "next";
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://electronic-lake.vercel.app";
const title = "Electronic Lake — Celulares importados en Argentina";
const description =
  "Teléfonos importados nuevos y en caja sellada. Xiaomi, Samsung, iPhone y más. Envíos en el día a todo el país, garantía de 6 meses y atención directa por WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · Electronic Lake",
  },
  description,
  applicationName: "Electronic Lake",
  keywords: [
    "celulares importados",
    "comprar celular Argentina",
    "iPhone Argentina",
    "Samsung Argentina",
    "Xiaomi Argentina",
    "Electronic Lake",
    "teléfonos nuevos caja sellada",
    "envíos todo el país",
  ],
  authors: [{ name: "Electronic Lake" }],
  creator: "Electronic Lake",
  publisher: "Electronic Lake",
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: "Electronic Lake",
    title,
    description,
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Electronic Lake",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "shopping",
};

export const viewport: Viewport = {
  themeColor: "#0b0e0a",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Electronic Lake",
    description,
    url: siteUrl,
    image: `${siteUrl}/logo.png`,
    address: { "@type": "PostalAddress", addressCountry: "AR", addressLocality: "Buenos Aires" },
    sameAs: [
      "https://www.instagram.com/electronic_lake/",
      "https://wa.me/5491138184414",
    ],
  };

  return (
    <html
      lang="es-AR"
      className={`${fraunces.variable} ${instrument.variable} ${jetbrains.variable} ${montserrat.variable}`}
    >
      <body className="min-h-dvh bg-paper text-ink antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
