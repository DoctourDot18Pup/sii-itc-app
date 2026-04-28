import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SII Linces — TecNM Celaya",
  description: "Sistema de Información Institucional",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
