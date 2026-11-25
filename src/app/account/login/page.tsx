import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInAction, signUpAction } from "@/app/account/actions";

type Props = { searchParams: Promise<{ error?: string; message?: string; mode?: string; next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const params = await searchParams;
  const signup = params.mode === "signup";
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/account";
  const isAdminDestination = next === "/admin" || next.startsWith("/admin/");

  if (user && (!isAdminDestination || user.app_metadata?.role === "admin")) redirect(next);

  return (
    <main className="account-page">
      <div className="auth-card">
        <p className="eyebrow eyebrow--dark">OWLZ LABEL / YOUR ACCOUNT</p>
        <h1>{signup ? "Create account." : "Welcome back."}</h1>
        <p>{signup ? "Create an account to keep track of your orders and saved delivery addresses." : "Sign in to view your orders, addresses and account details."}</p>
        {params.error && <p className="commerce-error" role="alert">{params.error}</p>}
        {params.message && <p className="account-notice">{params.message}</p>}
        {user && isAdminDestination && user.app_metadata?.role !== "admin" && <p className="account-notice">Please sign in again to refresh your admin access.</p>}
        <form className="auth-form" action={signup ? signUpAction : signInAction}>
          <input type="hidden" name="next" value={next}/>
          {signup && <label>Full name<input name="name" required minLength={2} autoComplete="name" /></label>}
          <label>Email address<input name="email" type="email" required autoComplete="email" /></label>
          <label>Password<input name="password" type="password" required minLength={8} autoComplete={signup ? "new-password" : "current-password"} /></label>
          <button type="submit">{signup ? "Create account" : "Sign in"} ↗</button>
        </form>
        <div className="auth-switch">
          {signup ? <>Already have an account? <Link href="/account/login">Sign in</Link></> : <>New to Owlz Label? <Link href={`/account/login?mode=signup${params.next ? "&next=" + encodeURIComponent(params.next) : ""}`}>Create an account</Link></>}
        </div>
        <p><Link href="/" className="cart-continue">← Back to the store</Link></p>
      </div>
    </main>
  );
}
