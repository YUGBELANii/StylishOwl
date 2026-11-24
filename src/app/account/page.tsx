import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, MapPin, Package, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/account/actions";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");
  const name = String(user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer");

  return (
    <main className="account-page">
      <header className="account-heading"><p className="eyebrow eyebrow--dark">STYLISHOWL / ACCOUNT</p><h1>Hello, {name}<span>.</span></h1><p>Manage your orders, delivery addresses and account details.</p></header>
      <section className="account-card"><h2>Account details</h2><p>{user.email}</p><p>Member since {new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p><form action={signOutAction}><button className="account-signout" type="submit">Sign out</button></form></section>
      <div className="account-links">
        <Link href="/account/orders" className="account-link-card"><Package size={20}/><span>My orders <ArrowUpRight size={16}/></span></Link>
        <Link href="/account/addresses" className="account-link-card"><MapPin size={20}/><span>Delivery addresses <ArrowUpRight size={16}/></span></Link>
        <Link href="/account/profile" className="account-link-card"><UserRound size={20}/><span>Profile settings <ArrowUpRight size={16}/></span></Link>
      </div>
    </main>
  );
}
