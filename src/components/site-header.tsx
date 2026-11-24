"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { useStoreCart } from "@/components/store-cart";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const { count } = useStoreCart();
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="StylishOwl home">STYLISH<span>OWL.</span></Link>
      <nav className="main-nav" aria-label="Main navigation">
        <Link href="/#collections">Collections</Link>
        <Link href="/#story">Our story</Link>
      </nav>
      <div className="header-right">
        <Link className="header-search" href="/search" aria-label="Search products"><Search size={17}/></Link>
        <Link className="header-account" href="/account"><UserRound size={17}/><span>Account</span></Link>
        <Link className="header-action" href="/cart" aria-label={`Shopping bag, ${count} items`}>
          <span>Bag{count > 0 ? ` (${count})` : ""}</span><ShoppingBag size={18} strokeWidth={1.8}/>
        </Link>
        <details className="mobile-menu">
          <summary aria-label="Open navigation menu"><Menu size={21} strokeWidth={1.7}/></summary>
          <nav className="mobile-menu-panel" aria-label="Mobile navigation">
            <Link href="/#collections">Collections <span>01</span></Link>
            <Link href="/#story">Our story <span>02</span></Link>
            <Link href="/account">Account <span>03</span></Link>
            <Link href="/cart">Shopping bag <span>{count}</span></Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
