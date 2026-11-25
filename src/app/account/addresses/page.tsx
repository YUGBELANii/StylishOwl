import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addAddressAction, deleteAddressAction } from "./actions";

type Props = { searchParams: Promise<{ error?: string; saved?: string }> };

export default async function AddressesPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");
  const [{ data: addresses }, params] = await Promise.all([
    supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }).order("created_at", { ascending: false }),
    searchParams,
  ]);
  return (
    <main className="account-page">
      <header className="account-heading"><p className="eyebrow eyebrow--dark">OWLZ LABEL / ACCOUNT</p><h1>Delivery addresses<span>.</span></h1><p>Save addresses for a quicker WhatsApp checkout.</p></header>
      {params.error && <p className="commerce-error">{params.error}</p>}
      {params.saved && <p className="account-notice">Address saved successfully.</p>}
      <div className="address-list">{addresses?.map((address) => <article className="order-card" key={address.id}>
        <div className="order-card-top"><div><h2>{address.recipient_name}</h2><p>{address.phone}</p></div>{address.is_default && <span className="order-status">Default</span>}</div>
        <p className="order-meta">{address.address_line1}{address.address_line2 ? ", " + address.address_line2 : ""}, {address.city}, {address.state} — {address.postal_code}</p>
        <form action={deleteAddressAction}><input type="hidden" name="id" value={address.id}/><button className="address-delete" type="submit">Remove address</button></form>
      </article>)}</div>
      <section className="account-card address-form-card"><h2>Add a delivery address</h2>
        <form className="checkout-fields" action={addAddressAction}>
          <label>Recipient name<input name="recipient_name" required /></label><label>Phone<input name="phone" required type="tel" /></label>
          <label className="checkout-wide">Address line 1<input name="address_line1" required /></label><label className="checkout-wide">Address line 2 (optional)<input name="address_line2" /></label>
          <label>City<input name="city" required /></label><label>State<input name="state" required /></label><label>PIN code<input name="postal_code" required pattern="[0-9]{6}" maxLength={6} /></label>
          <label className="checkout-wide address-default"><input type="checkbox" name="is_default"/> Set as default address</label>
          <button className="commerce-submit checkout-wide" type="submit">Save address ↗</button>
        </form>
      </section>
      <Link href="/account" className="cart-continue">← Back to account</Link>
    </main>
  );
}
