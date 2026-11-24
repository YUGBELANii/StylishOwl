import { requireAdmin } from "../../../../lib/supabase/admin";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adjustInventoryAction } from "./actions";

type Props = { searchParams: Promise<{ error?: string; saved?: string }> };

export default async function AdminInventoryPage({ searchParams }: Props) {
  const { supabase } = await requireAdmin("/admin/inventory");
  const [{ data: variants, error }, params] = await Promise.all([
    supabase.from("product_variants").select("id, sku, size, color, stock_quantity, product:products!inner(name)").eq("is_active", true).order("stock_quantity"),
    searchParams,
  ]);
  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><p className="eyebrow eyebrow--dark">STYLISHOWL / ADMIN</p><h1>Inventory.</h1><p>Current stock by product variant. Low-stock items appear first.</p></div></header>
      {params.error && <p className="commerce-error">{params.error}</p>}{params.saved && <p className="account-notice">Inventory updated.</p>}
      {error ? <div className="commerce-error">Unable to load inventory.</div> : variants?.length ? <div className="inventory-grid">{variants.map((variant) => {
        const product = Array.isArray(variant.product) ? variant.product[0] : variant.product;
        return <article className="inventory-card" key={variant.id}>
          <div><span className={variant.stock_quantity <= 3 ? "inventory-low" : "inventory-ok"}>{variant.stock_quantity <= 3 ? "LOW STOCK" : "IN STOCK"}</span><h2>{product?.name}</h2><p>{variant.size} / {variant.color}{variant.sku ? " · " + variant.sku : ""}</p></div>
          <form action={adjustInventoryAction} className="inventory-adjust"><input type="hidden" name="variant_id" value={variant.id}/><label>Available units<input name="stock_quantity" type="number" min="0" step="1" defaultValue={variant.stock_quantity}/></label><label>Adjustment note<input name="note" placeholder="Restock / correction" /></label><button type="submit">Save stock</button></form>
        </article>;
      })}</div> : <div className="admin-empty">No active product variants yet.</div>}
    </main>
  );
}
