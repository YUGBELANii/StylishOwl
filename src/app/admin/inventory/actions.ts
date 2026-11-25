"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function adjustInventoryAction(formData: FormData) {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const appMetadata = claims?.app_metadata as { role?: string } | undefined;
  if (claimsError || !claims?.sub || appMetadata?.role !== "admin") {
    redirect("/account/login?next=%2Fadmin%2Finventory");
  }

  const variantId = String(formData.get("variant_id") || "");
  const nextStock = Number(formData.get("stock_quantity"));
  const movementType = String(formData.get("movement_type") || "adjustment");
  const note = String(formData.get("note") || "").trim().slice(0, 180);

  if (!variantId || !Number.isInteger(nextStock) || nextStock < 0) {
    redirect("/admin/inventory?error=Enter+a+valid+stock+quantity");
  }
  if (!["adjustment", "restock", "damage"].includes(movementType)) {
    redirect("/admin/inventory?error=Invalid+stock+change+type");
  }

  const { data: variant, error: readError } = await supabase
    .from("product_variants")
    .select("stock_quantity")
    .eq("id", variantId)
    .single();

  if (readError || !variant) redirect("/admin/inventory?error=Product+variant+not+found");

  const delta = nextStock - variant.stock_quantity;
  if (movementType === "restock" && delta <= 0) {
    redirect("/admin/inventory?error=Restock+quantity+must+increase+stock");
  }
  if (movementType === "damage" && delta >= 0) {
    redirect("/admin/inventory?error=Damaged+or+removed+quantity+must+reduce+stock");
  }

  if (delta === 0) {
    revalidatePath("/admin/inventory");
    redirect("/admin/inventory?saved=1");
  }

  const { data: updated, error: updateError } = await supabase
    .from("product_variants")
    .update({ stock_quantity: nextStock, updated_at: new Date().toISOString() })
    .eq("id", variantId)
    .eq("stock_quantity", variant.stock_quantity)
    .select("id")
    .maybeSingle();

  if (updateError || !updated) {
    redirect("/admin/inventory?error=Stock+changed+elsewhere.+Refresh+and+try+again");
  }

  const { error: movementError } = await supabase.from("inventory_movements").insert({
    variant_id: variantId,
    movement_type: movementType,
    quantity_change: delta,
    reference: "Manual stock update",
    note: note || null,
    created_by: claims.sub,
  });

  if (movementError) {
    redirect("/admin/inventory?error=Stock+saved+but+the+movement+log+failed");
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/");
  redirect("/admin/inventory?saved=1");
}
