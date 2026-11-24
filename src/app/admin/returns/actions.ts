"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const statuses = ["requested", "approved", "rejected", "received", "refunded"];

export async function updateReturnStatusAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/");
  const id = String(formData.get("return_id") || "");
  const status = String(formData.get("status") || "");
  const admin_note = String(formData.get("admin_note") || "").trim();
  if (!id || !statuses.includes(status)) redirect("/admin/returns?error=Invalid+return+status");
  const { error } = await supabase.from("return_requests").update({ status, admin_note, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) redirect("/admin/returns?error=Unable+to+update+return");
  revalidatePath("/admin/returns");
  redirect("/admin/returns?saved=1");
}
