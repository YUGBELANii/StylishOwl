"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function requestReturnAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");
  const orderId = String(formData.get("order_id") || "");
  const reason = String(formData.get("reason") || "").trim();
  const details = String(formData.get("details") || "").trim();
  const allowed = ["wrong_size", "damaged", "wrong_item", "other"];
  if (!orderId || !allowed.includes(reason)) redirect("/account/orders?error=Choose+a+valid+return+reason");
  const { data: order } = await supabase.from("orders").select("id").eq("id", orderId).eq("user_id", user.id).eq("status", "delivered").maybeSingle();
  if (!order) redirect("/account/orders?error=Returns+are+available+for+delivered+orders");
  const { error } = await supabase.from("return_requests").insert({ order_id: orderId, user_id: user.id, reason, details: details || null });
  if (error) redirect("/account/orders?error=Unable+to+submit+return+request");
  revalidatePath("/account/orders");
  redirect("/account/orders?returnRequested=1");
}
