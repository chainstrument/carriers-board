import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getCurrentTheme } from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareerBoard",
  description: "ERP personnel pour piloter sa carrière de développeur.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getCurrentTheme();
  const themeClass = theme === "dark" ? "dark" : theme === "dev" ? "theme-dev" : "";

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${themeClass} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
