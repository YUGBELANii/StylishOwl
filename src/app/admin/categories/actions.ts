"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createCategoryAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const image_url = String(formData.get("image_url") || "").trim();
  const slug = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (name.length < 2 || !slug || (image_url && !/^https?:\/\//i.test(image_url))) redirect("/admin/categories?error=Check+the+category+details");
  const { error } = await supabase.from("categories").insert({ name, slug, description: description || null, image_url: image_url || null, is_active: true });
  if (error) redirect("/admin/categories?error=Unable+to+create+category");
  revalidatePath("/");
  redirect("/admin/categories?saved=1");
}
