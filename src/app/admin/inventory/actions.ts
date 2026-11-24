"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function adjustInventoryAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/");
  const variantId = String(formData.get("variant_id") || "");
  const nextStock = Number(formData.get("stock_quantity"));
  const note = String(formData.get("note") || "").trim();
  if (!variantId || !Number.isInteger(nextStock) || nextStock < 0) redirect("/admin/inventory?error=Invalid+stock+quantity");
  const { data: variant, error: readError } = await supabase.from("product_variants").select("stock_quantity").eq("id", variantId).single();
  if (readError || !variant) redirect("/admin/inventory?error=Variant+not+found");
  const delta = nextStock - variant.stock_quantity;
  const { error: updateError } = await supabase.from("product_variants").update({ stock_quantity: nextStock, updated_at: new Date().toISOString() }).eq("id", variantId);
  if (updateError) redirect("/admin/inventory?error=Unable+to+update+stock");
  if (delta !== 0) {
    const { error: movementError } = await supabase.from("inventory_movements").insert({
      variant_id: variantId, movement_type: "adjustment", quantity_change: delta,
      reference: "Manual stock adjustment", note: note || null, created_by: user.id,
    });
    if (movementError) redirect("/admin/inventory?error=Stock+updated+but+movement+log+failed");
  }
  revalidatePath("/admin/inventory");
  redirect("/admin/inventory?saved=1");
}
