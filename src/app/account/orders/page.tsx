import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requestReturnAction } from "./actions";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
type Props = { searchParams: Promise<{ error?: string; returnRequested?: string }> };

export default async function AccountOrdersPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");
  const [{ data: orders, error }, params] = await Promise.all([
    supabase.from("orders").select("id, order_number, status, payment_status, grand_total, created_at, order_items(id, product_name, size, color, quantity, unit_price, line_total), return_requests(id, status, reason, created_at)")
      .eq("user_id", user.id).order("created_at", { ascending: false }),
    searchParams,
  ]);

  return (
    <main className="account-page">
      <header className="account-heading"><p className="eyebrow eyebrow--dark">STYLISHOWL / ACCOUNT</p><h1>Your orders<span>.</span></h1><p>Order updates and delivery progress will appear here.</p></header>
      {params.error && <p className="commerce-error">{params.error}</p>}
      {params.returnRequested && <p className="account-notice">Your return request has been submitted.</p>}
      {error ? <div className="commerce-error">We couldn't load your orders. Please refresh the page.</div> :
        orders?.length ? <div className="order-list">{orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-card-top"><div><h2>Order SO-{order.order_number}</h2><p>{new Date(order.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</p></div><span className="order-status">{order.status.replaceAll("_"," ")}</span></div>
            <div className="order-items">{order.order_items.map((item) => <div className="order-item-row" key={item.id}><span>{item.product_name} · {item.size} / {item.color} × {item.quantity}</span><strong>{money.format(item.line_total)}</strong></div>)}</div>
            <div className="order-total"><span>Total</span><strong>{money.format(order.grand_total)}</strong></div>
            <p className="order-meta">Payment: {order.payment_status === "pending" ? "To be arranged with the store" : order.payment_status}</p>
            {order.return_requests?.map((request) => <p className="account-notice" key={request.id}>Return request: {request.status.replaceAll("_"," ")} · {request.reason.replaceAll("_"," ")}</p>)}
            {order.status === "delivered" && !order.return_requests?.length && <form action={requestReturnAction} className="return-request-form">
              <input type="hidden" name="order_id" value={order.id}/>
              <label>Request a return<select name="reason" required defaultValue=""><option value="" disabled>Select a reason</option><option value="wrong_size">Wrong size</option><option value="damaged">Damaged item</option><option value="wrong_item">Wrong item received</option><option value="other">Other</option></select></label>
              <label>Details (optional)<input name="details" placeholder="Add a short explanation"/></label>
              <button type="submit">Submit return request</button>
            </form>}
          </article>
        ))}</div> : <div className="admin-empty">You haven't placed any orders yet. <Link href="/#collections">Explore the collection</Link>.</div>}
    </main>
  );
}
