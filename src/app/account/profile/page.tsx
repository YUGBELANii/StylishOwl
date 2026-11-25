import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfileAction } from "./actions";

type Props = { searchParams: Promise<{ error?: string; saved?: string }> };

export default async function ProfilePage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");
  const [{ data: profile }, params] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
    searchParams,
  ]);
  return (
    <main className="account-page">
      <header className="account-heading"><p className="eyebrow eyebrow--dark">OWLZ LABEL / ACCOUNT</p><h1>Profile settings<span>.</span></h1><p>Keep your contact details up to date.</p></header>
      {params.error && <p className="commerce-error">{params.error}</p>}{params.saved && <p className="account-notice">Profile updated.</p>}
      <section className="auth-card"><form className="auth-form" action={updateProfileAction}>
        <label>Full name<input name="full_name" required minLength={2} defaultValue={profile?.full_name || String(user.user_metadata?.full_name || "")}/></label>
        <label>Email address<input value={user.email || ""} readOnly disabled/></label>
        <label>Phone number<input name="phone" type="tel" defaultValue={profile?.phone || ""} placeholder="10-digit phone number"/></label>
        <button type="submit">Save profile ↗</button>
      </form></section>
    </main>
  );
}
