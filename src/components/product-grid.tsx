"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import type { CatalogProduct } from "@/lib/catalog";

type Props = { products: CatalogProduct[] };

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function ProductGrid({ products }: Props) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(search.trim().toLowerCase())
    );

    if (sort === "price-low") filtered.sort((a, b) => a.base_price - b.base_price);
    if (sort === "price-high") filtered.sort((a, b) => b.base_price - a.base_price);
    if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "featured") filtered.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));

    return filtered;
  }, [products, search, sort]);

  return (
    <div className="catalog">
      <div className="catalog-toolbar">
        <label className="catalog-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search this collection"
            aria-label="Search products"
          />
        </label>
        <label className="catalog-sort">
          <SlidersHorizontal size={16} />
          <span className="sr-only">Sort products</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="featured">Featured first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </label>
      </div>

      <p className="catalog-count">{visibleProducts.length} {visibleProducts.length === 1 ? "piece" : "pieces"}</p>

      {visibleProducts.length ? (
        <div className="product-grid">
          {visibleProducts.map((product, index) => {
            const image = [...product.images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary))[0];
            const inStock = product.variants.some((variant) => variant.stock_quantity > 0);
            return (
              <Link className="product-card" href={`/product/${product.slug}`} key={product.id}>
                <div className="product-card-image" style={image ? { backgroundImage: `url("${image.image_url}")` } : undefined}>
                  {!image && <span className="product-placeholder">SO<span> / {String(index + 1).padStart(2, "0")}</span></span>}
                  {product.is_featured && <span className="product-tag">FEATURED</span>}
                  <span className="product-card-arrow"><ArrowUpRight size={18} /></span>
                </div>
                <div className="product-card-info">
                  <div>
                    <h2>{product.name}</h2>
                    <p>{product.brand_label || "StylishOwl essentials"}</p>
                  </div>
                  <div className="product-price">
                    <strong>{money.format(product.base_price)}</strong>
                    {product.compare_at_price && product.compare_at_price > product.base_price && (
                      <del>{money.format(product.compare_at_price)}</del>
                    )}
                  </div>
                </div>
                <span className={`stock-note ${inStock ? "stock-note--available" : "stock-note--unavailable"}`}>
                  {inStock ? "Available" : "Currently unavailable"}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="empty-catalog">
          <span className="empty-catalog-mark">SO.</span>
          <h2>{search ? "No matching pieces." : "The first drop is getting ready."}</h2>
          <p>{search ? "Try another search term." : "We're preparing this collection. Check back soon for the first pieces."}</p>
        </div>
      )}
    </div>
  );
}
