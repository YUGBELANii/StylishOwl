import { createClient } from "@/lib/supabase/server";

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

export type CatalogVariant = {
  id: string;
  size: string;
  color: string;
  color_code: string | null;
  price: number | null;
  stock_quantity: number;
};

export type CatalogImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand_label: string | null;
  base_price: number;
  compare_at_price: number | null;
  is_featured: boolean;
  images: CatalogImage[];
  variants: CatalogVariant[];
};

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export async function getCategoryBySlug(slug: string) {
  if (!hasSupabaseConfig()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Unable to load category:", error.message);
    return null;
  }

  return data as CatalogCategory | null;
}

export async function getProductsByCategory(categoryId: string): Promise<CatalogProduct[]> {
  if (!hasSupabaseConfig()) return [];

  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, description, brand_label, base_price, compare_at_price, is_featured")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !products?.length) {
    if (error) console.error("Unable to load products:", error.message);
    return [];
  }

  const ids = products.map((product) => product.id);
  const [{ data: images }, { data: variants }] = await Promise.all([
    supabase
      .from("product_images")
      .select("id, product_id, image_url, alt_text, is_primary, sort_order")
      .in("product_id", ids)
      .order("sort_order", { ascending: true }),
    supabase
      .from("product_variants")
      .select("id, product_id, size, color, color_code, price, stock_quantity")
      .in("product_id", ids)
      .eq("is_active", true),
  ]);

  return products.map((product) => ({
    ...product,
    base_price: Number(product.base_price),
    compare_at_price: product.compare_at_price === null ? null : Number(product.compare_at_price),
    images: ((images ?? []) as (CatalogImage & { product_id: string })[])
      .filter((image) => image.product_id === product.id),
    variants: ((variants ?? []) as (CatalogVariant & { product_id: string })[])
      .filter((variant) => variant.product_id === product.id)
      .map((variant) => ({ ...variant, price: variant.price === null ? null : Number(variant.price) })),
  }));
}


export async function getActiveCategories(): Promise<CatalogCategory[]> {
  if (!hasSupabaseConfig()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("Unable to load categories:", error.message);
    return [];
  }
  return (data ?? []) as CatalogCategory[];
}

export async function getFeaturedProducts(limit = 8): Promise<CatalogProduct[]> {
  if (!hasSupabaseConfig()) return [];
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, description, brand_label, base_price, compare_at_price, is_featured")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !products?.length) {
    if (error) console.error("Unable to load featured products:", error.message);
    return [];
  }

  const ids = products.map((product) => product.id);
  const [{ data: images }, { data: variants }] = await Promise.all([
    supabase.from("product_images")
      .select("id, product_id, image_url, alt_text, is_primary, sort_order")
      .in("product_id", ids)
      .order("sort_order", { ascending: true }),
    supabase.from("product_variants")
      .select("id, product_id, size, color, color_code, price, stock_quantity")
      .in("product_id", ids)
      .eq("is_active", true),
  ]);

  return products.map((product) => ({
    ...product,
    base_price: Number(product.base_price),
    compare_at_price: product.compare_at_price === null ? null : Number(product.compare_at_price),
    images: ((images ?? []) as (CatalogImage & { product_id: string })[])
      .filter((image) => image.product_id === product.id),
    variants: ((variants ?? []) as (CatalogVariant & { product_id: string })[])
      .filter((variant) => variant.product_id === product.id)
      .map((variant) => ({ ...variant, price: variant.price === null ? null : Number(variant.price) })),
  }));
}

export async function getProductBySlug(slug: string): Promise<(CatalogProduct & { category: CatalogCategory }) | null> {
  if (!hasSupabaseConfig()) return null;

  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("id, name, slug, description, brand_label, base_price, compare_at_price, is_featured, category_id")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !product) {
    if (error) console.error("Unable to load product:", error.message);
    return null;
  }

  const [{ data: category }, { data: images }, { data: variants }] = await Promise.all([
    supabase.from("categories").select("id, name, slug, description, image_url").eq("id", product.category_id).maybeSingle(),
    supabase.from("product_images").select("id, image_url, alt_text, is_primary, sort_order").eq("product_id", product.id).order("sort_order"),
    supabase.from("product_variants").select("id, size, color, color_code, price, stock_quantity").eq("product_id", product.id).eq("is_active", true),
  ]);

  if (!category) return null;

  return {
    ...product,
    base_price: Number(product.base_price),
    compare_at_price: product.compare_at_price === null ? null : Number(product.compare_at_price),
    category: category as CatalogCategory,
    images: (images ?? []) as CatalogImage[],
    variants: (variants ?? []).map((variant) => ({
      ...variant,
      price: variant.price === null ? null : Number(variant.price),
    })) as CatalogVariant[],
  };
}


export async function searchCatalog(query: string): Promise<CatalogProduct[]> {
  const term = query.trim().slice(0, 80);
  if (!term || !hasSupabaseConfig()) return [];
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, description, brand_label, base_price, compare_at_price, is_featured")
    .eq("is_active", true)
    .ilike("name", `%${term}%`)
    .order("is_featured", { ascending: false })
    .limit(60);

  if (error || !products?.length) {
    if (error) console.error("Unable to search products:", error.message);
    return [];
  }

  const ids = products.map((product) => product.id);
  const [{ data: images }, { data: variants }] = await Promise.all([
    supabase.from("product_images")
      .select("id, product_id, image_url, alt_text, is_primary, sort_order")
      .in("product_id", ids).order("sort_order", { ascending: true }),
    supabase.from("product_variants")
      .select("id, product_id, size, color, color_code, price, stock_quantity")
      .in("product_id", ids).eq("is_active", true),
  ]);

  return products.map((product) => ({
    ...product,
    base_price: Number(product.base_price),
    compare_at_price: product.compare_at_price === null ? null : Number(product.compare_at_price),
    images: ((images ?? []) as (CatalogImage & { product_id: string })[])
      .filter((image) => image.product_id === product.id),
    variants: ((variants ?? []) as (CatalogVariant & { product_id: string })[])
      .filter((variant) => variant.product_id === product.id)
      .map((variant) => ({ ...variant, price: variant.price === null ? null : Number(variant.price) })),
  }));
}
