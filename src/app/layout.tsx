import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yumea Move — Bouge un peu, souvent",
  description:
    "Des séances de sport courtes (5 à 30 min) à faire à la maison, sans matériel. Programmes personnalisés, minuteur et coach vocal.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Yumea Move", statusBarStyle: "default" },
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#d95f76",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
