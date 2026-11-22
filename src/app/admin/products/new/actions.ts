"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionState = { error?: string; success?: string };

export async function createProductAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== "admin") {
    return { error: "You do not have permission to add products." };
  }

  const name = String(formData.get("name") || "").trim();
  const categoryId = String(formData.get("category_id") || "");
  const description = String(formData.get("description") || "").trim();
  const brandLabel = String(formData.get("brand_label") || "STYLISHOWL").trim();
  const basePrice = Number(formData.get("base_price"));
  const compareRaw = String(formData.get("compare_at_price") || "").trim();
  const compareAtPrice = compareRaw ? Number(compareRaw) : null;
  const featured = formData.get("is_featured") === "on";
  const imageUrls = String(formData.get("image_urls") || "")
    .split("\n").map((url) => url.trim()).filter(Boolean);
  const variantsRaw = String(formData.get("variants") || "[]");

  if (!name || !categoryId || !Number.isFinite(basePrice) || basePrice <= 0) {
    return { error: "Add a product name, category, and valid base price." };
  }
  if (compareAtPrice !== null && (!Number.isFinite(compareAtPrice) || compareAtPrice < basePrice)) {
    return { error: "Compare-at price must be greater than the selling price." };
  }
  if (imageUrls.some((url) => !/^https?:\/\//i.test(url))) {
    return { error: "Each product image must be a valid https:// or http:// URL." };
  }

  let variants: { size: string; color: string; color_code?: string; price?: number | null; stock_quantity: number; sku?: string }[];
  try {
    variants = JSON.parse(variantsRaw);
  } catch {
    return { error: "Variant data is invalid. Please review the size and color rows." };
  }
  if (!Array.isArray(variants) || variants.length === 0 || variants.some((v) =>
    !v.size?.trim() || !v.color?.trim() || !Number.isInteger(Number(v.stock_quantity)) || Number(v.stock_quantity) < 0
  )) {
    return { error: "Add at least one variant with a size, color, and stock quantity." };
  }

  const slug = name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + crypto.randomUUID().slice(0, 6);

  const { data: product, error: productError } = await supabase.from("products").insert({
    category_id: categoryId,
    name,
    slug,
    description: description || null,
    brand_label: brandLabel || null,
    base_price: basePrice,
    compare_at_price: compareAtPrice,
    is_featured: featured,
    is_active: true,
  }).select("id").single();

  if (productError || !product) {
    return { error: productError?.message || "Unable to create the product." };
  }

  const variantRows = variants.map((variant) => ({
    product_id: product.id,
    size: variant.size.trim(),
    color: variant.color.trim(),
    color_code: variant.color_code || null,
    price: variant.price === null || variant.price === undefined || variant.price === "" ? null : Number(variant.price),
    stock_quantity: Number(variant.stock_quantity),
    sku: variant.sku?.trim() || null,
    is_active: true,
  }));
  const { error: variantError } = await supabase.from("product_variants").insert(variantRows);

  if (variantError) {
    await supabase.from("products").delete().eq("id", product.id);
    return { error: "Product was not saved because its variants failed: " + variantError.message };
  }

  if (imageUrls.length) {
    const imageRows = imageUrls.map((image_url, index) => ({
      product_id: product.id,
      image_url,
      alt_text: name,
      sort_order: index,
      is_primary: index === 0,
    }));
    const { error: imageError } = await supabase.from("product_images").insert(imageRows);
    if (imageError) {
      await supabase.from("products").delete().eq("id", product.id);
      return { error: "Product was not saved because its images failed: " + imageError.message };
    }
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/product/${slug}`);
  redirect(`/admin/products/new?created=${encodeURIComponent(name)}`);
}
