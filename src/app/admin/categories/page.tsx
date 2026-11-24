import { requireAdmin } from "../../../../lib/supabase/admin";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createCategoryAction } from "./actions";

type Props = { searchParams: Promise<{ error?: string; saved?: string }> };

export default async function AdminCategoriesPage({ searchParams }: Props) {
  const { supabase } = await requireAdmin("/admin/categories");
  const [{ data: categories, error }, params] = await Promise.all([
    supabase.from("categories").select("id,name,slug,description,is_active,sort_order").order("sort_order"),
    searchParams,
  ]);
  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><p className="eyebrow eyebrow--dark">STYLISHOWL / ADMIN</p><h1>Collections.</h1><p>Organize the storefront catalogue.</p></div></header>
      {params.error && <p className="commerce-error">{params.error}</p>}{params.saved && <p className="account-notice">Collection created.</p>}
      <section className="account-card coupon-create"><h2>Create a collection</h2><form action={createCategoryAction} className="auth-form">
        <label>Collection name<input name="name" required placeholder="e.g. Oversized Hoodies"/></label>
        <label>Description<textarea name="description" rows={3}/></label>
        <label>Cover image URL (optional)<input name="image_url" type="url" placeholder="https://..."/></label>
        <button type="submit">Create collection ↗</button>
      </form></section>
      <h2 className="admin-subheading">Existing collections</h2>
      {error ? <p className="commerce-error">Unable to load collections.</p> : categories?.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Slug</th><th>Status</th><th>Order</th></tr></thead><tbody>{categories.map((category) => <tr key={category.id}><td>{category.name}</td><td>{category.slug}</td><td>{category.is_active ? "Active" : "Hidden"}</td><td>{category.sort_order}</td></tr>)}</tbody></table></div> : <div className="admin-empty">No collections yet.</div>}
    </main>
  );
}
