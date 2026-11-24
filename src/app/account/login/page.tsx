import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInAction, signUpAction } from "@/app/account/actions";

type Props = { searchParams: Promise<{ error?: string; message?: string; mode?: string; next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/account");
  const params = await searchParams;
  const signup = params.mode === "signup";

  return (
    <main className="account-page">
      <div className="auth-card">
        <p className="eyebrow eyebrow--dark">STYLISHOWL / YOUR ACCOUNT</p>
        <h1>{signup ? "Create account." : "Welcome back."}</h1>
        <p>{signup ? "Create an account to keep track of your orders and saved delivery addresses." : "Sign in to view your orders, addresses and account details."}</p>
        {params.error && <p className="commerce-error" role="alert">{params.error}</p>}
        {params.message && <p className="account-notice">{params.message}</p>}
        <form className="auth-form" action={signup ? signUpAction : signInAction}>\n          <input type="hidden" name="next" value={params.next || "/account"}/>
          {signup && <label>Full name<input name="name" required minLength={2} autoComplete="name" /></label>}
          <label>Email address<input name="email" type="email" required autoComplete="email" /></label>
          <label>Password<input name="password" type="password" required minLength={8} autoComplete={signup ? "new-password" : "current-password"} /></label>
          <button type="submit">{signup ? "Create account" : "Sign in"} ↗</button>
        </form>
        <div className="auth-switch">
          {signup ? <>Already have an account? <Link href="/account/login">Sign in</Link></> : <>New to StylishOwl? <Link href="/account/login?mode=signup">Create an account</Link></>}
        </div>
        <p><Link href="/" className="cart-continue">← Back to the store</Link></p>
      </div>
    </main>
  );
}
