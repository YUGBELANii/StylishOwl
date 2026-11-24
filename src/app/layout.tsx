import type { Metadata } from "next";
import "./globals.css";
import "./shop.css";
import "./commerce.css";
import { SiteHeader } from "@/components/site-header";
import { StoreCartProvider } from "@/components/store-cart";

export const metadata: Metadata = {
  title: "StylishOwl — Everyday, redefined",
  description: "A fresh clothing storefront for everyday essentials.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StoreCartProvider>
          <SiteHeader />
          {children}
        </StoreCartProvider>
      </body>
    </html>
  );
}
