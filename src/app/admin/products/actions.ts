"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/");
  return supabase;
}

export async function toggleProductAction(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") || "");
  const active = String(formData.get("active") || "") === "true";
  if (!id) redirect("/admin/products");
  const { error } = await supabase.from("products").update({ is_active: active, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) redirect("/admin/products?error=Unable+to+update+product");
  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products?saved=1");
}

export async function updateProductAction(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const base_price = Number(formData.get("base_price"));
  const compareRaw = String(formData.get("compare_at_price") || "").trim();
  const compare_at_price = compareRaw ? Number(compareRaw) : null;
  const is_featured = formData.get("is_featured") === "on";
  if (!id || name.length < 2 || !Number.isFinite(base_price) || base_price < 0 ||
      (compare_at_price !== null && (!Number.isFinite(compare_at_price) || compare_at_price < base_price))) {
    redirect("/admin/products?error=Check+the+product+details");
  }
  const { error } = await supabase.from("products").update({
    name, description: description || null, base_price, compare_at_price, is_featured,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) redirect("/admin/products?error=Unable+to+save+product");
  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products?saved=1");
}
