import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminReturnsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/");
  const { data: returns, error } = await supabase.from("return_requests")
    .select("id, order_id, user_id, reason, details, status, admin_note, created_at, order:orders(order_number)")
    .order("created_at", { ascending: false }).limit(100);
  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><p className="eyebrow eyebrow--dark">STYLISHOWL / ADMIN</p><h1>Returns.</h1><p>Review customer return requests.</p></div></header>
      {error ? <p className="commerce-error">Unable to load return requests. Apply the WhatsApp checkout migration if this table is missing.</p> : returns?.length ? <div className="admin-order-list">{returns.map((request) => {
        const order = Array.isArray(request.order) ? request.order[0] : request.order;
        return <article className="admin-order-card" key={request.id}><div className="order-card-top"><div><h2>Order SO-{order?.order_number ?? "—"}</h2><p>{request.reason.replaceAll("_"," ")} · {new Date(request.created_at).toLocaleDateString("en-IN")}</p><p>{request.details || "No additional details."}</p></div><span className="order-status">{request.status}</span></div></article>;
      })}</div> : <div className="admin-empty">No return requests yet.</div>}
    </main>
  );
}
