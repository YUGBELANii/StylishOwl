"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2, ImagePlus, CheckCircle2 } from "lucide-react";
import { createProductAction } from "./actions";

type Category = { id: string; name: string };
type Variant = { size: string; color: string; color_code: string; price: string; stock_quantity: string; sku: string };

const initialVariant: Variant = { size: "M", color: "Black", color_code: "#171717", price: "", stock_quantity: "0", sku: "" };
const initialState = { error: "", success: "" };

export function ProductForm({ categories, created }: { categories: Category[]; created?: string }) {
  const [state, action, pending] = useActionState(createProductAction, initialState);
  const [variants, setVariants] = useState<Variant[]>([{ ...initialVariant }]);
  const updateVariant = (index: number, key: keyof Variant, value: string) =>
    setVariants((current) => current.map((variant, i) => i === index ? { ...variant, [key]: value } : variant));

  return (
    <form action={action} className="admin-product-form">
      {created && <div className="admin-success"><CheckCircle2 size={17} /> “{created}” has been added to your catalogue.</div>}
      <div className="admin-form-section">
        <div className="admin-section-heading"><span>01 / PRODUCT DETAILS</span><small>Start with the essentials</small></div>
        <div className="admin-form-grid">
          <label className="admin-field admin-field--wide">Product name<input name="name" required placeholder="e.g. Relaxed Fit Denim" /></label>
          <label className="admin-field">Category<select name="category_id" required defaultValue=""><option value="" disabled>Select a category</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
          <label className="admin-field">Brand label<input name="brand_label" defaultValue="STYLISHOWL" /></label>
          <label className="admin-field">Selling price (₹)<input name="base_price" type="number" min="1" step="0.01" required placeholder="1299" /></label>
          <label className="admin-field">Compare-at price (₹)<input name="compare_at_price" type="number" min="0" step="0.01" placeholder="Optional" /></label>
          <label className="admin-field admin-field--wide">Description<textarea name="description" rows={4} placeholder="Describe the fit, fabric, feel and details..." /></label>
          <label className="admin-check"><input type="checkbox" name="is_featured" /> Feature this product on the storefront</label>
        </div>
      </div>

      <div className="admin-form-section">
        <div className="admin-section-heading"><span>02 / PRODUCT IMAGES</span><small>First URL becomes the main image</small></div>
        <label className="admin-field">Image URLs<textarea name="image_urls" rows={4} placeholder={"https://your-image-host.com/product-front.jpg\nhttps://your-image-host.com/product-back.jpg"} /></label>
        <p className="admin-field-hint"><ImagePlus size={15} /> Add one publicly accessible image URL per line. Image file upload/storage can be connected once a storage bucket is configured.</p>
      </div>

      <div className="admin-form-section">
        <div className="admin-section-heading"><span>03 / SIZE & COLOUR VARIANTS</span><small>Set stock for each combination</small></div>
        {variants.map((variant, index) => (
          <div className="admin-variant-row" key={index}>
            <label className="admin-field">Size<input value={variant.size} onChange={(e) => updateVariant(index, "size", e.target.value)} placeholder="M" /></label>
            <label className="admin-field">Color<input value={variant.color} onChange={(e) => updateVariant(index, "color", e.target.value)} placeholder="Black" /></label>
            <label className="admin-field">Color code<input value={variant.color_code} onChange={(e) => updateVariant(index, "color_code", e.target.value)} placeholder="#171717" /></label>
            <label className="admin-field">Price override<input type="number" min="0" step="0.01" value={variant.price} onChange={(e) => updateVariant(index, "price", e.target.value)} placeholder="Base price" /></label>
            <label className="admin-field">Stock<input type="number" min="0" step="1" value={variant.stock_quantity} onChange={(e) => updateVariant(index, "stock_quantity", e.target.value)} /></label>
            <button type="button" className="admin-remove-variant" onClick={() => setVariants((current) => current.filter((_, i) => i !== index))} aria-label="Remove variant" disabled={variants.length === 1}><Trash2 size={16} /></button>
          </div>
        ))}
        <button type="button" className="admin-add-variant" onClick={() => setVariants((current) => [...current, { ...initialVariant }])}><Plus size={15} /> Add another variant</button>
        <input type="hidden" name="variants" value={JSON.stringify(variants.map((variant) => ({ ...variant, price: variant.price === "" ? null : Number(variant.price), stock_quantity: Number(variant.stock_quantity) })))} />
      </div>

      {state.error && <p className="admin-form-error" role="alert">{state.error}</p>}
      <div className="admin-form-submit"><p>Review the details before publishing. Product will be active immediately.</p><button type="submit" disabled={pending}>{pending ? "Saving product..." : "Save product"} <span>↗</span></button></div>
    </form>
  );
}
