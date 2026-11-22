"use client";

import { useMemo, useState } from "react";
import type { CatalogVariant } from "@/lib/catalog";

type Props = { variants: CatalogVariant[]; basePrice: number };

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function ProductOptions({ variants, basePrice }: Props) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const colors = useMemo(
    () => Array.from(new Map(variants.map((variant) => [variant.color, variant])).values()),
    [variants]
  );
  const sizes = useMemo(
    () => variants.filter((variant) => !selectedColor || variant.color === selectedColor),
    [variants, selectedColor]
  );
  const selectedVariant = variants.find(
    (variant) => variant.size === selectedSize && variant.color === selectedColor
  );

  if (!variants.length) {
    return <p className="variant-empty">Sizes and availability will be updated soon.</p>;
  }

  return (
    <div className="product-options">
      <div className="option-group">
        <div className="option-heading"><span>COLOUR</span><strong>{selectedColor || "Choose a colour"}</strong></div>
        <div className="color-options">
          {colors.map((variant) => (
            <button
              type="button"
              key={variant.color}
              className={`color-option ${selectedColor === variant.color ? "is-selected" : ""}`}
              onClick={() => { setSelectedColor(variant.color); setSelectedSize(""); }}
              aria-label={variant.color}
              aria-pressed={selectedColor === variant.color}
              title={variant.color}
            >
              <span style={{ backgroundColor: variant.color_code || "#b8b4a8" }} />
            </button>
          ))}
        </div>
      </div>
      <div className="option-group">
        <div className="option-heading"><span>SIZE</span><strong>{selectedSize || "Choose a size"}</strong></div>
        <div className="size-options">
          {Array.from(new Set(sizes.map((variant) => variant.size))).map((size) => {
            const available = sizes.some((variant) => variant.size === size && variant.stock_quantity > 0);
            return (
              <button
                type="button"
                key={size}
                disabled={!available}
                className={`size-option ${selectedSize === size ? "is-selected" : ""}`}
                onClick={() => setSelectedSize(size)}
                aria-pressed={selectedSize === size}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
      <div className="variant-summary">
        <span>{selectedVariant ? (selectedVariant.stock_quantity > 0 ? `${selectedVariant.stock_quantity} in stock` : "Out of stock") : "Select a colour and size"}</span>
        <strong>{money.format(selectedVariant?.price ?? basePrice)}</strong>
      </div>
      <button className="add-to-bag" type="button" disabled={!selectedVariant || selectedVariant.stock_quantity < 1}>
        {selectedVariant ? "Add to bag — coming soon" : "Select options"}
      </button>
      <p className="cart-note">Shopping bag and checkout are not connected yet.</p>
    </div>
  );
}
