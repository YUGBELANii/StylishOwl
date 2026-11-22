import type { Metadata } from "next";
import "./globals.css";
import "./shop.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "StylishOwl — Everyday, redefined",
  description: "A fresh clothing storefront for everyday essentials.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
