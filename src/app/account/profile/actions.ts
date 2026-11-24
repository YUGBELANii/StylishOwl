"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");
  const full_name = String(formData.get("full_name") || "").trim();
  const phone = String(formData.get("phone") || "").replace(/\D/g, "");
  if (full_name.length < 2 || (phone && phone.length < 10)) redirect("/account/profile?error=Enter+a+valid+name+and+phone");
  const { error } = await supabase.from("profiles").upsert({ id: user.id, full_name, phone: phone || null, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) redirect("/account/profile?error=Unable+to+update+profile");
  revalidatePath("/account");
  redirect("/account/profile?saved=1");
}
