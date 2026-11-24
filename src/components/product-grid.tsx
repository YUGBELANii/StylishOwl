"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import type { CatalogProduct } from "@/lib/catalog";

type Props = { products: CatalogProduct[]; showToolbar?: boolean; showCount?: boolean };
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function ProductGrid({ products, showToolbar = true, showCount = true }: Props) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [availability, setAvailability] = useState("all");
  const [priceRange, setPriceRange] = useState("all");

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.trim().toLowerCase());
      const inStock = product.variants.some((variant) => variant.stock_quantity > 0);
      const matchesAvailability = availability === "all" || inStock;
      const matchesPrice = priceRange === "all" ||
        (priceRange === "under-1000" && product.base_price < 1000) ||
        (priceRange === "1000-2000" && product.base_price >= 1000 && product.base_price <= 2000) ||
        (priceRange === "over-2000" && product.base_price > 2000);
      return matchesSearch && matchesAvailability && matchesPrice;
    });

    if (sort === "price-low") filtered.sort((a, b) => a.base_price - b.base_price);
    if (sort === "price-high") filtered.sort((a, b) => b.base_price - a.base_price);
    if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "featured") filtered.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    return filtered;
  }, [products, search, sort, availability, priceRange]);

  return (
    <div className="catalog">
      {showToolbar && <div className="catalog-toolbar">
        <label className="catalog-search"><Search size={17}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" aria-label="Search products"/></label>
        <div className="catalog-filters">
          <label className="catalog-sort"><SlidersHorizontal size={16}/><span className="sr-only">Availability</span><select value={availability} onChange={(event) => setAvailability(event.target.value)}><option value="all">All availability</option><option value="in-stock">In stock only</option></select></label>
          <label className="catalog-sort"><span className="sr-only">Price range</span><select value={priceRange} onChange={(event) => setPriceRange(event.target.value)}><option value="all">All prices</option><option value="under-1000">Under ₹1,000</option><option value="1000-2000">₹1,000–₹2,000</option><option value="over-2000">Over ₹2,000</option></select></label>
          <label className="catalog-sort"><span className="sr-only">Sort products</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured first</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A to Z</option></select></label>
        </div>
      </div>}
      {showCount && <p className="catalog-count">{visibleProducts.length} {visibleProducts.length === 1 ? "piece" : "pieces"}</p>}
      {visibleProducts.length ? <div className="product-grid">
        {visibleProducts.map((product, index) => {
          const sortedImages = [...product.images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
          const image = sortedImages[0];
          const alternateImage = sortedImages[1];
          const inStock = product.variants.some((variant) => variant.stock_quantity > 0);
          const sizes = [...new Set(product.variants.filter((variant) => variant.stock_quantity > 0 && variant.size).map((variant) => variant.size as string))];
          const colors = [...new Map(product.variants.filter((variant) => variant.stock_quantity > 0 && variant.color).map((variant) => [variant.color, variant.color_code || "#b9b1a5"])).entries()].slice(0, 5);
          const discount = product.compare_at_price && product.compare_at_price > product.base_price
            ? Math.round((1 - product.base_price / product.compare_at_price) * 100)
            : 0;

          return (
            <Link className="product-card product-card--refined" href={`/product/${product.slug}`} key={product.id}>
              <div className="product-card-image product-card-image--refined">
                {image ? (
                  <>
                    <span className="product-card-photo" style={{ backgroundImage: `url("${image.image_url}")` }} role="img" aria-label={image.alt_text || product.name} />
                    {alternateImage && <span className="product-card-photo product-card-photo--alternate" style={{ backgroundImage: `url("${alternateImage.image_url}")` }} aria-hidden="true" />}
                  </>
                ) : <span className="product-placeholder">SO<span> / {String(index + 1).padStart(2, "0")}</span></span>}
                <span className="product-card-badges">
                  {discount > 0 && <span className="product-card-badge product-card-badge--sale">{discount}% OFF</span>}
                  {product.is_featured && <span className="product-card-badge product-card-badge--featured">BEST PICK</span>}
                </span>
                <span className="product-card-view">View product <ArrowUpRight size={14} /></span>
                {!inStock && <span className="product-card-soldout">SOLD OUT</span>}
              </div>
              <div className="product-card-details">
                <div className="product-card-title-row">
                  <div className="product-card-title-copy">
                    <p className="product-card-brand">{product.brand_label || "STYLISHOWL"}</p>
                    <h2>{product.name}</h2>
                  </div>
                  <div className="product-price product-price--refined">
                    <strong>{money.format(product.base_price)}</strong>
                    {discount > 0 && <del>{money.format(product.compare_at_price as number)}</del>}
                  </div>
                </div>
                <div className="product-card-meta">
                  <div className="product-card-options">
                    {colors.length > 0 && (
                      <span className="product-card-swatches" aria-label={`${colors.length} available colours`}>
                        {colors.map(([name, code]) => <i key={name} title={name} style={{ backgroundColor: code }} />)}
                      </span>
                    )}
                    {sizes.length > 0 && <span className="product-card-sizes">{sizes.slice(0, 4).join(" · ")}{sizes.length > 4 ? " +" : ""}</span>}
                  </div>
                  <span className={`product-card-stock ${inStock ? "is-in-stock" : "is-sold-out"}`}>
                    <i /> {inStock ? "In stock" : "Sold out"}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div> : <div className="empty-catalog"><span className="empty-catalog-mark">SO.</span><h2>{search || availability !== "all" || priceRange !== "all" ? "No matching pieces." : "The first drop is getting ready."}</h2><p>{search || availability !== "all" || priceRange !== "all" ? "Try changing your search or filters." : "We're preparing this collection. Check back soon for the first pieces."}</p></div>}
    </div>
  );
}
