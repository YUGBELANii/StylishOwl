import Link from "next/link";
import { ShoppingBag } from "lucide-react";

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
      <Link className="header-action" href="/#collections" aria-label="Explore shopping">
        <span>Shop now</span><ShoppingBag size={18} strokeWidth={1.8} />
      </Link>
    </header>
  );
}
