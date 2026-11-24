"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CatalogVariant } from "@/lib/catalog";
import { useStoreCart } from "@/components/store-cart";

type Props = {
  variants: CatalogVariant[];
  basePrice: number;
  productId: string;
  productName: string;
  productSlug: string;
  image: string | null;
};

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function ProductOptions({ variants, basePrice, productId, productName, productSlug, image }: Props) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [added, setAdded] = useState(false);
  const { addItem } = useStoreCart();

  const colors = useMemo(() => Array.from(new Map(variants.map((variant) => [variant.color, variant])).values()), [variants]);
  const sizes = useMemo(() => variants.filter((variant) => !selectedColor || variant.color === selectedColor), [variants, selectedColor]);
  const selectedVariant = variants.find((variant) => variant.size === selectedSize && variant.color === selectedColor);

  if (!variants.length) return <p className="variant-empty">Sizes and availability will be updated soon.</p>;

  function addSelected() {
    if (!selectedVariant || selectedVariant.stock_quantity < 1) return;
    addItem({
      variantId: selectedVariant.id,
      productId,
      slug: productSlug,
      name: productName,
      image,
      size: selectedVariant.size,
      color: selectedVariant.color,
      unitPrice: Number(selectedVariant.price ?? basePrice),
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="product-options">
      <div className="option-group">
        <div className="option-heading"><span>COLOUR</span><strong>{selectedColor || "Choose a colour"}</strong></div>
        <div className="color-options">
          {colors.map((variant) => (
            <button type="button" key={variant.color} className={`color-option ${selectedColor === variant.color ? "is-selected" : ""}`}
              onClick={() => { setSelectedColor(variant.color); setSelectedSize(""); }}
              aria-label={variant.color} aria-pressed={selectedColor === variant.color} title={variant.color}>
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
            return <button type="button" key={size} disabled={!available}
              className={`size-option ${selectedSize === size ? "is-selected" : ""}`}
              onClick={() => setSelectedSize(size)} aria-pressed={selectedSize === size}>{size}</button>;
          })}
        </div>
      </div>
      <div className="variant-summary">
        <span>{selectedVariant ? (selectedVariant.stock_quantity > 0 ? `${selectedVariant.stock_quantity} in stock` : "Out of stock") : "Select a colour and size"}</span>
        <strong>{money.format(selectedVariant?.price ?? basePrice)}</strong>
      </div>
      <button className="add-to-bag" type="button" disabled={!selectedVariant || selectedVariant.stock_quantity < 1} onClick={addSelected}>
        {added ? "Added to your bag ✓" : selectedVariant ? "Add to bag" : "Select options"}
      </button>
      <p className="cart-note">Checkout is completed through WhatsApp. No online payment is required.</p>
    </div>
  );
}
