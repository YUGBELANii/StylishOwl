import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateOrderStatusAction } from "./actions";

type Props = { searchParams: Promise<{ error?: string; saved?: string; status?: string }> };
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const statuses = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "refunded"];

export default async function AdminOrdersPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/");
  const params = await searchParams;
  let query = supabase.from("orders").select("id, order_number, user_id, address_snapshot, subtotal, discount_total, shipping_total, grand_total, status, payment_status, customer_note, shipping_carrier, tracking_number, tracking_url, created_at, order_items(id, product_name, sku, size, color, quantity, unit_price, line_total)").order("created_at", { ascending: false }).limit(100);
  if (params.status && statuses.includes(params.status)) query = query.eq("status", params.status);
  const { data: orders, error } = await query;

  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><p className="eyebrow eyebrow--dark">STYLISHOWL / ADMIN</p><h1>Order management.</h1><p>WhatsApp order requests, fulfilment and delivery status.</p></div></header>
      <nav className="admin-filter-row"><a href="/admin/orders">All orders</a>{statuses.map((status) => <a href={`/admin/orders?status=${status}`} key={status}>{status}</a>)}</nav>
      {params.error && <p className="commerce-error">{params.error}</p>}{params.saved && <p className="account-notice">Order status updated.</p>}
      {error ? <div className="commerce-error">Unable to load orders: {error.message}</div> :
        orders?.length ? <div className="admin-order-list">{orders.map((order) => {
          const address = (order.address_snapshot || {}) as Record<string,string>;
          return <article className="admin-order-card" key={order.id}>
            <div className="order-card-top"><div><h2>SO-{order.order_number}</h2><p>{new Date(order.created_at).toLocaleString("en-IN")} · {address.recipient_name || "Guest checkout"} · {address.phone || "No phone"}</p><p>{[address.address_line1,address.city,address.state,address.postal_code].filter(Boolean).join(", ")}</p></div><span className="order-status">{order.status}</span></div>
            <div className="order-items">{order.order_items.map((item) => <div className="order-item-row" key={item.id}><span>{item.product_name} · {item.size}/{item.color} × {item.quantity}</span><strong>{money.format(item.line_total)}</strong></div>)}</div>
            <div className="admin-order-bottom"><div><strong>{money.format(order.grand_total)}</strong><small>Payment status: {order.payment_status} · WhatsApp checkout</small>{order.customer_note && <small>Note: {order.customer_note}</small>}</div>
              <form className="admin-status-form" action={updateOrderStatusAction}>
                <input type="hidden" name="order_id" value={order.id}/>
                <label className="sr-only" htmlFor={`status-${order.id}`}>Order status</label>
                <select id={`status-${order.id}`} name="status" defaultValue={order.status}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
                <input name="shipping_total" type="number" min="0" step="1" defaultValue={order.shipping_total} placeholder="Delivery charge (₹)"/>
                <input name="shipping_carrier" defaultValue={order.shipping_carrier || ""} placeholder="Carrier (optional)"/>
                <input name="tracking_number" defaultValue={order.tracking_number || ""} placeholder="Tracking number"/>
                <input name="tracking_url" defaultValue={order.tracking_url || ""} placeholder="Tracking URL (https://...)"/>
                <button type="submit">Save update</button>
              </form>
            </div>
          </article>;
        })}</div> : <div className="admin-empty">No orders found for this filter.</div>}
    </main>
  );
}
