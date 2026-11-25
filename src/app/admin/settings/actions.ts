"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveWhatsAppNumberAction(formData: FormData) {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const appMetadata = claims?.app_metadata as { role?: string } | undefined;

  if (claimsError || !claims?.sub || appMetadata?.role !== "admin") {
    redirect("/account/login?next=%2Fadmin%2Fsettings");
  }

  const whatsappNumber = String(formData.get("whatsapp_number") || "").replace(/\D/g, "");
  if (!/^[0-9]{8,15}$/.test(whatsappNumber)) {
    redirect("/admin/settings?error=Enter+a+valid+WhatsApp+number+with+country+code");
  }

  const { error } = await supabase
    .from("store_settings")
    .update({ whatsapp_number: whatsappNumber, updated_at: new Date().toISOString() })
    .eq("id", "primary");

  if (error) {
    redirect("/admin/settings?error=Unable+to+save+the+WhatsApp+number");
  }

  revalidatePath("/admin/settings");
  revalidatePath("/cart");
  redirect("/admin/settings?saved=1");
}
