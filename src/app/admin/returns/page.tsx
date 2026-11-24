import { requireAdmin } from "../../../../lib/supabase/admin";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateReturnStatusAction } from "./actions";

type Props = { searchParams: Promise<{ error?: string; saved?: string }> };
const statuses = ["requested", "approved", "rejected", "received", "refunded"];

export default async function AdminReturnsPage({ searchParams }: Props) {
  const { supabase } = await requireAdmin("/admin/returns");
  const [{ data: returns, error }, params] = await Promise.all([
    supabase.from("return_requests").select("id, order_id, user_id, reason, details, status, admin_note, created_at, order:orders(order_number)").order("created_at", { ascending: false }).limit(100),
    searchParams,
  ]);
  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><p className="eyebrow eyebrow--dark">STYLISHOWL / ADMIN</p><h1>Returns.</h1><p>Review and process customer return requests.</p></div></header>
      {params.error && <p className="commerce-error">{params.error}</p>}{params.saved && <p className="account-notice">Return request updated.</p>}
      {error ? <p className="commerce-error">Unable to load return requests. Apply the WhatsApp checkout migration if this table is missing.</p> : returns?.length ? <div className="admin-order-list">{returns.map((request) => {
        const order = Array.isArray(request.order) ? request.order[0] : request.order;
        return <article className="admin-order-card" key={request.id}>
          <div className="order-card-top"><div><h2>Order SO-{order?.order_number ?? "—"}</h2><p>{request.reason.replaceAll("_"," ")} · {new Date(request.created_at).toLocaleDateString("en-IN")}</p><p>{request.details || "No additional details."}</p></div><span className="order-status">{request.status}</span></div>
          <form className="admin-status-form return-admin-form" action={updateReturnStatusAction}>
            <input type="hidden" name="return_id" value={request.id}/>
            <select name="status" defaultValue={request.status}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
            <input name="admin_note" defaultValue={request.admin_note || ""} placeholder="Internal note / response"/>
            <button type="submit">Update request</button>
          </form>
        </article>;
      })}</div> : <div className="admin-empty">No return requests yet.</div>}
    </main>
  );
}
