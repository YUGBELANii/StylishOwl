"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const transitions: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export async function updateOrderStatusAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/");
  const id = String(formData.get("order_id") || "");
  const status = String(formData.get("status") || "");
  const shipping_carrier = String(formData.get("shipping_carrier") || "").trim();
  const tracking_number = String(formData.get("tracking_number") || "").trim();
  const tracking_url = String(formData.get("tracking_url") || "").trim();
  const shipping_total = Number(formData.get("shipping_total") || 0);
  if (!id || !Object.hasOwn(transitions, status)) redirect("/admin/orders?error=Invalid+order+status");
  if (tracking_url && !/^https?:\/\//i.test(tracking_url)) redirect("/admin/orders?error=Tracking+URL+must+start+with+https");
  if (!Number.isFinite(shipping_total) || shipping_total < 0) redirect("/admin/orders?error=Invalid+shipping+charge");
  const { data: order } = await supabase.from("orders").select("status, subtotal, discount_total").eq("id", id).maybeSingle();
  if (!order) redirect("/admin/orders?error=Order+not+found");
  if (status !== order.status && !transitions[order.status]?.includes(status)) {
    redirect("/admin/orders?error=That+order+status+transition+is+not+allowed");
  }
  const { error } = await supabase.from("orders").update({
    status,
    shipping_total,
    grand_total: Math.max(0, Number(order.subtotal) - Number(order.discount_total) + shipping_total),
    shipping_carrier: shipping_carrier || null,
    tracking_number: tracking_number || null,
    tracking_url: tracking_url || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("status", order.status);
  if (error) redirect("/admin/orders?error=" + encodeURIComponent(error.message));
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
  redirect("/admin/orders?saved=1");
}
