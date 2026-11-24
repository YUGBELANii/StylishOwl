import { requireAdmin } from "../../../lib/supabase/admin";
import { createCouponAction } from "./actions";

type Props = { searchParams: Promise<{ error?: string; saved?: string }> };
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default async function AdminCouponsPage({ searchParams }: Props) {
  const { supabase } = await requireAdmin("/admin/coupons");
  const [{ data: coupons, error }, params] = await Promise.all([
    supabase.from("coupons").select("*").order("created_at", { ascending: false }),
    searchParams,
  ]);
  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><p className="eyebrow eyebrow--dark">STYLISHOWL / ADMIN</p><h1>Discounts.</h1><p>Create promotional codes for future checkout campaigns.</p></div></header>
      {params.error && <p className="commerce-error">{params.error}</p>}{params.saved && <p className="account-notice">Coupon created.</p>}
      <section className="account-card coupon-create"><h2>Create a coupon</h2><form action={createCouponAction} className="checkout-fields">
        <label>Coupon code<input name="code" required minLength={3} maxLength={30} placeholder="WELCOME10"/></label>
        <label>Discount type<select name="discount_type"><option value="percentage">Percentage</option><option value="fixed">Fixed amount (₹)</option></select></label>
        <label>Discount value<input name="discount_value" type="number" min="1" step="0.01" required/></label>
        <label>Minimum order value<input name="minimum_order_value" type="number" min="0" step="1" defaultValue="0"/></label>
        <label>Maximum discount (₹)<input name="maximum_discount" type="number" min="0" step="1"/></label>
        <label>Usage limit<input name="usage_limit" type="number" min="1" step="1" placeholder="Unlimited"/></label>
        <label>Starts at<input name="starts_at" type="datetime-local"/></label><label>Expires at<input name="expires_at" type="datetime-local"/></label>
        <label className="address-default checkout-wide"><input type="checkbox" name="is_active"/> Activate coupon immediately</label>
        <button className="commerce-submit checkout-wide" type="submit">Create coupon ↗</button>
      </form></section>
      <h2 className="admin-subheading">Existing coupons</h2>
      {error ? <p className="commerce-error">Unable to load coupons.</p> : coupons?.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Code</th><th>Discount</th><th>Minimum</th><th>Usage</th><th>Status</th><th>Expiry</th></tr></thead><tbody>{coupons.map((coupon) => <tr key={coupon.id}><td><strong>{coupon.code}</strong></td><td>{coupon.discount_type === "percentage" ? coupon.discount_value + "%" : money.format(coupon.discount_value)}</td><td>{money.format(coupon.minimum_order_value)}</td><td>{coupon.usage_count}{coupon.usage_limit ? " / " + coupon.usage_limit : ""}</td><td>{coupon.is_active ? "Active" : "Inactive"}</td><td>{coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString("en-IN") : "No expiry"}</td></tr>)}</tbody></table></div> : <div className="admin-empty">No coupons created yet.</div>}
    </main>
  );
}
