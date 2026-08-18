import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  const description = "GLOBAL + DOCILE: operação de conteúdo, revisão e aprovação em um só fluxo.";
  return {
    title: { default: "GLOBAL + DOCILE · Content Ops", template: "%s · GLOBAL + DOCILE" },
    description,
    icons: { icon: "/brand/docile-color.png", shortcut: "/brand/docile-color.png" },
    openGraph: { title: "Conteúdo certo. Aprovação certa.", description, images: [{ url: image, width: 1672, height: 941 }] },
    twitter: { card: "summary_large_image", title: "Conteúdo certo. Aprovação certa.", description, images: [image] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
