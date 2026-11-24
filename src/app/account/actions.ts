"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: FormDataEntryValue | null) {
  const path = String(value || "/account");
  return path.startsWith("/") && !path.startsWith("//") ? path : "/account";
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = safeNext(formData.get("next"));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/account/login?error=" + encodeURIComponent(error.message));
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("profiles").upsert({
      id: user.id,
      full_name: String(user.user_metadata?.full_name || ""),
    }, { onConflict: "id", ignoreDuplicates: true });
  }
  redirect(next);
}

export async function signUpAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = safeNext(formData.get("next"));
  if (name.length < 2 || password.length < 8) redirect("/account/login?mode=signup&error=" + encodeURIComponent("Use your name and a password with at least 8 characters."));
  const supabase = await createClient();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) redirect("/account/login?mode=signup&error=" + encodeURIComponent(error.message));
  if (!data.session) redirect("/account/login?mode=signup&next=" + encodeURIComponent(next) + "&message=" + encodeURIComponent("Check your email to confirm your account, then sign in."));
  if (data.user) {
    await supabase.from("profiles").upsert({ id: data.user.id, full_name: name }, { onConflict: "id", ignoreDuplicates: true });
  }
  redirect(next);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
