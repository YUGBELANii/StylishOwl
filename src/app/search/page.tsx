import type { Metadata } from "next";
import { Search } from "lucide-react";
import { ProductGrid } from "@/components/product-grid";
import { searchCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Search — Owlz Label", description: "Search the Owlz Label clothing collection." };
type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const products = await searchCatalog(q);
  return (
    <main className="shop-page search-page">
      <section className="shop-heading">
        <p className="eyebrow eyebrow--dark">OWLZ LABEL / DISCOVER</p>
        <h1>Find your fit<span>.</span></h1>
        <p>Search across the full collection.</p>
        <form className="global-search-form" action="/search" method="get">
          <Search size={18}/><input type="search" name="q" defaultValue={q} placeholder="Try denim, shirts, essentials..." aria-label="Search all products"/>
          <button type="submit">Search ↗</button>
        </form>
      </section>
      {q.trim() ? <><p className="catalog-count">Results for “{q}” · {products.length} found</p><ProductGrid products={products}/></> : <div className="empty-catalog"><span className="empty-catalog-mark">SO.</span><h2>What are you looking for?</h2><p>Enter a product name to explore the collection.</p></div>}
    </main>
  );
}
