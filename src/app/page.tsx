import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductGrid } from "@/components/product-grid";
import { getActiveCategories, getFeaturedProducts } from "@/lib/catalog";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getActiveCategories(),
    getFeaturedProducts(8),
  ]);

  return (
    <main className="store-home">
      <nav id="collections" className="home-category-nav" aria-label="Shop by category">
        <span className="home-category-label">SHOP BY CATEGORY</span>
        <div className="home-category-links">
          {categories.map((category) => (
            <Link href={`/shop/${category.slug}`} key={category.id}>{category.name}<ArrowRight size={13} /></Link>
          ))}
          {categories.length === 0 && <span className="home-category-empty">New collections coming soon</span>}
        </div>
      </nav>

      <section className="home-promo" aria-label="Store promotion">
        <div className="home-promo-copy">
          <span className="home-promo-kicker"><Sparkles size={13} /> THE EVERYDAY EDIT</span>
          <h1>Good style. <em>No effort.</em></h1>
          <p>Explore easy-to-wear pieces made for your everyday rotation.</p>
        </div>
        <Link href={categories[0] ? `/shop/${categories[0].slug}` : "/search"} className="home-promo-link">
          Shop the collection <ArrowRight size={16} />
        </Link>
        <span className="home-promo-index">STYLISHOWL / 001</span>
      </section>

      <section className="home-products" aria-labelledby="home-products-title">
        <div className="home-products-heading">
          <div>
            <p className="eyebrow eyebrow--dark">CURATED FOR YOU</p>
            <h2 id="home-products-title">Shop the <em>latest.</em></h2>
          </div>
          <Link href={categories[0] ? `/shop/${categories[0].slug}` : "/search"}>Explore all <ArrowRight size={15} /></Link>
        </div>
        <ProductGrid products={products} showToolbar={false} showCount={false} />
      </section>

      <section id="story" className="home-brand-note">
        <p>LESS NOISE. BETTER CHOICES. <em>MORE YOU.</em></p>
      </section>

      <footer className="site-footer">
        <Link className="wordmark wordmark--footer" href="/">STYLISH<span>OWL.</span></Link>
        <span>Thoughtful pieces for your everyday rotation.</span>
        <span>© 2026 StylishOwl</span>
      </footer>
    </main>
  );
}
