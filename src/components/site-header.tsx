import Link from "next/link";
import { Menu, ShoppingBag } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="StylishOwl home">
        STYLISH<span>OWL.</span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <Link href="/#collections">Collections</Link>
        <Link href="/#story">Our story</Link>
      </nav>
      <div className="header-right">
        <Link className="header-action" href="/#collections" aria-label="Explore shopping">
          <span>Shop now</span><ShoppingBag size={18} strokeWidth={1.8} />
        </Link>
        <details className="mobile-menu">
          <summary aria-label="Open navigation menu"><Menu size={21} strokeWidth={1.7} /></summary>
          <nav className="mobile-menu-panel" aria-label="Mobile navigation">
            <Link href="/#collections">Collections <span>01</span></Link>
            <Link href="/#story">Our story <span>02</span></Link>
            <Link href="/#collections">Shop now <span>↗</span></Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
