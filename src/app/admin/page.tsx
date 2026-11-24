import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, ClipboardList, PackagePlus, Boxes, Users, TicketPercent, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/");
  const [{ count: products }, { count: orders }, { count: customers }, { data: recent }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id, order_number, status, grand_total, created_at").order("created_at", { ascending: false }).limit(5),
  ]);
  const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  const links = [
    { href: "/admin/products/new", title: "Add product", detail: "Publish a product with variants", icon: PackagePlus },
    { href: "/admin/orders", title: "Orders", detail: "Review and update order status", icon: ClipboardList },
    { href: "/admin/inventory", title: "Inventory", detail: "Monitor and adjust stock", icon: Boxes },
    { href: "/admin/customers", title: "Customers", detail: "View customer profiles", icon: Users },
    { href: "/admin/coupons", title: "Discounts", detail: "Create and manage coupons", icon: TicketPercent },
    { href: "/admin/returns", title: "Returns", detail: "Review return requests", icon: RotateCcw },
  ];
  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><p className="eyebrow eyebrow--dark">STYLISHOWL / ADMIN</p><h1>Store overview.</h1><p>Your store operations, in one place.</p></div><Link className="text-link" href="/">View storefront <ArrowUpRight size={16}/></Link></header>
      <section className="admin-dashboard-grid">
        <div className="admin-dashboard-card"><span>PRODUCTS</span><strong>{products ?? 0}</strong></div>
        <div className="admin-dashboard-card"><span>ORDERS</span><strong>{orders ?? 0}</strong></div>
        <div className="admin-dashboard-card"><span>CUSTOMER PROFILES</span><strong>{customers ?? 0}</strong></div>
      </section>
      <section className="admin-tools-grid">{links.map(({href,title,detail,icon:Icon}) => <Link className="admin-tool-card" href={href} key={href}><Icon size={20}/><strong>{title}</strong><span>{detail}</span><ArrowUpRight size={16}/></Link>)}</section>
      <section className="admin-recent"><div className="commerce-section-heading"><span>RECENT ORDERS</span><Link href="/admin/orders">View all ↗</Link></div>
        {recent?.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Date</th><th>Status</th><th>Total</th></tr></thead><tbody>{recent.map((order) => <tr key={order.id}><td>SO-{order.order_number}</td><td>{new Date(order.created_at).toLocaleDateString("en-IN")}</td><td>{order.status}</td><td>{money.format(order.grand_total)}</td></tr>)}</tbody></table></div> : <div className="admin-empty">No orders yet.</div>}
      </section>
    </main>
  );
}
