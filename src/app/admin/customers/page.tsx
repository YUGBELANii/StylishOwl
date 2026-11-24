import { requireAdmin } from "../../../lib/supabase/admin";

export default async function AdminCustomersPage() {
  const { supabase } = await requireAdmin("/admin/customers");
  const { data: profiles, error } = await supabase.from("profiles").select("id, full_name, phone, created_at").order("created_at", { ascending: false }).limit(200);
  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><p className="eyebrow eyebrow--dark">STYLISHOWL / ADMIN</p><h1>Customers.</h1><p>Registered customer accounts and contact details.</p></div></header>
      {error ? <div className="commerce-error">Unable to load customer profiles.</div> : profiles?.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Phone</th><th>Customer ID</th><th>Joined</th></tr></thead><tbody>{profiles.map((profile) => <tr key={profile.id}><td>{profile.full_name || "Customer"}</td><td>{profile.phone || "—"}</td><td>{profile.id.slice(0,8)}…</td><td>{new Date(profile.created_at).toLocaleDateString("en-IN")}</td></tr>)}</tbody></table></div> : <div className="admin-empty">No customer profiles yet.</div>}
    </main>
  );
}
