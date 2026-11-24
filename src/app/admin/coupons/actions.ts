"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createCouponAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/");
  const code = String(formData.get("code") || "").trim().toUpperCase().replace(/\s+/g, "");
  const discount_type = String(formData.get("discount_type") || "");
  const discount_value = Number(formData.get("discount_value"));
  const minimum_order_value = Number(formData.get("minimum_order_value") || 0);
  const maximum_discount_raw = String(formData.get("maximum_discount") || "");
  const maximum_discount = maximum_discount_raw ? Number(maximum_discount_raw) : null;
  const usage_limit_raw = String(formData.get("usage_limit") || "");
  const usage_limit = usage_limit_raw ? Number(usage_limit_raw) : null;
  const starts_at = String(formData.get("starts_at") || "");
  const expires_at = String(formData.get("expires_at") || "");
  if (!/^[A-Z0-9_-]{3,30}$/.test(code) || !["percentage","fixed"].includes(discount_type) ||
      !Number.isFinite(discount_value) || discount_value <= 0 ||
      (discount_type === "percentage" && discount_value > 100) ||
      !Number.isFinite(minimum_order_value) || minimum_order_value < 0 ||
      (maximum_discount !== null && (!Number.isFinite(maximum_discount) || maximum_discount < 0)) ||
      (usage_limit !== null && (!Number.isInteger(usage_limit) || usage_limit < 1))) {
    redirect("/admin/coupons?error=Check+the+coupon+details");
  }
  const { error } = await supabase.from("coupons").insert({
    code, discount_type, discount_value, minimum_order_value, maximum_discount,
    usage_limit, starts_at: starts_at || null, expires_at: expires_at || null,
    is_active: formData.get("is_active") === "on",
  });
  if (error) redirect("/admin/coupons?error=Unable+to+create+coupon");
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons?saved=1");
}
