"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addAddressAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");
  const recipient_name = String(formData.get("recipient_name") || "").trim();
  const phone = String(formData.get("phone") || "").replace(/\D/g, "");
  const address_line1 = String(formData.get("address_line1") || "").trim();
  const address_line2 = String(formData.get("address_line2") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();
  const postal_code = String(formData.get("postal_code") || "").trim();
  if (!recipient_name || phone.length < 10 || !address_line1 || !city || !state || !/^\d{6}$/.test(postal_code)) redirect("/account/addresses?error=Check+the+address+details");
  const isDefault = formData.get("is_default") === "on";
  if (isDefault) await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  const { error } = await supabase.from("addresses").insert({
    user_id: user.id, recipient_name, phone, address_line1, address_line2: address_line2 || null,
    city, state, postal_code, country: "India", is_default: isDefault,
  });
  if (error) redirect("/account/addresses?error=Unable+to+save+address");
  revalidatePath("/account/addresses");
  redirect("/account/addresses?saved=1");
}

export async function deleteAddressAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");
  const id = String(formData.get("id") || "");
  await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}
