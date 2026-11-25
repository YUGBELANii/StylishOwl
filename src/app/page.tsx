import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductGrid } from "@/components/product-grid";
import { getActiveCategories, getFeaturedProducts } from "@/lib/catalog";

export default async function HomePage() {
  const [categories, products] = await Promise.all([
    getActiveCategories(),
    getFeaturedProducts(8),
  ]);

  return (
    <main className="store-home">
      <section className="home-intro" aria-labelledby="home-title">
        <div className="home-intro-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> THE STYLISHOWL COLLECTION</p>
          <h1 id="home-title">Find your <em>everyday</em> style.</h1>
          <p>Easy-to-wear pieces, thoughtfully picked for your wardrobe.</p>
        </div>
        <Link href="#categories" className="home-intro-link">Explore collections <ArrowRight size={16} /></Link>
      </section>

      <section id="categories" className="home-categories" aria-labelledby="categories-title">
        <div className="home-section-heading">
          <div>
            <p className="eyebrow">START BROWSING</p>
            <h2 id="categories-title">Shop by <em>category.</em></h2>
          </div>
          <span>{categories.length} {categories.length === 1 ? "collection" : "collections"}</span>
        </div>
        {categories.length > 0 ? (
          <div className="home-category-grid">
            {categories.map((category, index) => (
              <Link className="home-category-card" href={`/shop/${category.slug}`} key={category.id}>
                <span
                  className={`home-category-image${category.image_url ? " has-image" : ""}`}
                  style={category.image_url ? { backgroundImage: `url("${category.image_url}")` } : undefined}
                  role={category.image_url ? "img" : undefined}
                  aria-label={category.image_url ? category.name : undefined}
                >
                  {!category.image_url && <span className="home-category-placeholder">{String(index + 1).padStart(2, "0")}</span>}
                </span>
                <span className="home-category-card-bottom">
                  <strong>{category.name}</strong>
                  <span>Explore <ArrowRight size={15} /></span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="home-category-empty">New collections are on their way.</p>
        )}
      </section>

      <section className="home-products" aria-labelledby="home-products-title">
        <div className="home-section-heading">
          <div>
            <p className="eyebrow">THE CURRENT EDIT</p>
            <h2 id="home-products-title">Featured <em>pieces.</em></h2>
          </div>
          <Link href="/search">View all products <ArrowRight size={15} /></Link>
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
