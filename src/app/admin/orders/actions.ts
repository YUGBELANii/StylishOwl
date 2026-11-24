"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const allowed = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "refunded"];

export async function updateOrderStatusAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/");
  const id = String(formData.get("order_id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !allowed.includes(status)) redirect("/admin/orders?error=Invalid+order+status");
  const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) redirect("/admin/orders?error=Unable+to+update+order");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
  redirect("/admin/orders?saved=1");
}
