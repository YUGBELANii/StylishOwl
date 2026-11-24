import { requireAdmin } from "@/lib/supabase/admin";
import { adjustInventoryAction } from "./actions";

type Props = { searchParams: Promise<{ error?: string; saved?: string }> };

function getRelated<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function AdminInventoryPage({ searchParams }: Props) {
  const { supabase } = await requireAdmin("/admin/inventory");
  const [{ data: variants, error }, { data: movements, error: movementError }, params] = await Promise.all([
    supabase
      .from("product_variants")
      .select("id, sku, size, color, stock_quantity, product:products!inner(name, is_active)")
      .eq("is_active", true)
      .order("stock_quantity", { ascending: true }),
    supabase
      .from("inventory_movements")
      .select("id, movement_type, quantity_change, reference, note, created_at, variant:product_variants!inner(size, color, product:products!inner(name))")
      .order("created_at", { ascending: false })
      .limit(12),
    searchParams,
  ]);

  const activeVariants = (variants ?? []).filter((variant) => {
    const product = getRelated(variant.product);
    return product?.is_active !== false;
  });
  const totalUnits = activeVariants.reduce((sum, variant) => sum + variant.stock_quantity, 0);
  const lowStock = activeVariants.filter((variant) => variant.stock_quantity > 0 && variant.stock_quantity <= 5).length;
  const outOfStock = activeVariants.filter((variant) => variant.stock_quantity === 0).length;

  return (
    <main className="admin-page inventory-page">
      <header className="admin-page-heading">
        <div>
          <p className="eyebrow eyebrow--dark">STYLISHOWL / OPERATIONS</p>
          <h1>Stock management.</h1>
          <p>Update available units for every size and colour. Stock changes are recorded in the movement history.</p>
        </div>
      </header>

      {params.error && <p className="commerce-error">{params.error}</p>}
      {params.saved && <p className="account-notice">Stock saved. The available quantity has been updated.</p>}

      {error ? (
        <div className="commerce-error">Unable to load current stock. Check the product variant permissions and try again.</div>
      ) : (
        <>
          <section className="inventory-summary" aria-label="Stock summary">
            <article className="inventory-summary-card"><span>ACTIVE VARIANTS</span><strong>{activeVariants.length}</strong><small>Size and colour combinations</small></article>
            <article className="inventory-summary-card"><span>TOTAL AVAILABLE</span><strong>{totalUnits.toLocaleString("en-IN")}</strong><small>Units currently in stock</small></article>
            <article className="inventory-summary-card inventory-summary-card--warning"><span>LOW STOCK</span><strong>{lowStock}</strong><small>Between 1 and 5 units</small></article>
            <article className="inventory-summary-card inventory-summary-card--empty"><span>OUT OF STOCK</span><strong>{outOfStock}</strong><small>Unavailable variants</small></article>
          </section>

          <section className="inventory-section">
            <div className="inventory-section-heading">
              <div><span>LIVE STOCK</span><h2>Product variants</h2></div>
              <small>Set the new available quantity and save</small>
            </div>
            {activeVariants.length ? (
              <div className="inventory-grid">
                {activeVariants.map((variant) => {
                  const product = getRelated(variant.product);
                  const stockState = variant.stock_quantity === 0 ? "OUT OF STOCK" : variant.stock_quantity <= 5 ? "LOW STOCK" : "IN STOCK";
                  const stockClass = variant.stock_quantity === 0 || variant.stock_quantity <= 5 ? "inventory-low" : "inventory-ok";
                  return (
                    <article className="inventory-card" key={variant.id}>
                      <div className="inventory-card-top">
                        <div>
                          <span className={stockClass}>{stockState}</span>
                          <h3>{product?.name ?? "Unnamed product"}</h3>
                          <p>{variant.size} / {variant.color}{variant.sku ? " · " + variant.sku : ""}</p>
                        </div>
                        <div className="inventory-current-stock"><strong>{variant.stock_quantity}</strong><span>AVAILABLE</span></div>
                      </div>
                      <form action={adjustInventoryAction} className="inventory-adjust">
                        <input type="hidden" name="variant_id" value={variant.id} />
                        <label>New quantity<input name="stock_quantity" type="number" min="0" step="1" required defaultValue={variant.stock_quantity} /></label>
                        <label>Change type<select name="movement_type" defaultValue="adjustment"><option value="adjustment">Stock correction</option><option value="restock">Restock received</option><option value="damage">Damaged / removed</option></select></label>
                        <label className="inventory-note-field">Note<input name="note" maxLength={180} placeholder="e.g. 12 units received" /></label>
                        <button type="submit">Save stock</button>
                      </form>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="admin-empty">No active product variants yet. Add a product and create its size and colour variants first.</div>
            )}
          </section>

          <section className="inventory-section inventory-history">
            <div className="inventory-section-heading">
              <div><span>STOCK AUDIT</span><h2>Recent movements</h2></div>
              <small>Latest 12 stock changes</small>
            </div>
            {movementError ? (
              <p className="commerce-error">Stock is available, but movement history could not be loaded.</p>
            ) : movements?.length ? (
              <div className="inventory-history-list">
                {movements.map((movement) => {
                  const variant = getRelated(movement.variant);
                  const product = getRelated(variant?.product);
                  const positive = movement.quantity_change > 0;
                  return (
                    <article className="inventory-history-row" key={movement.id}>
                      <div className="inventory-history-main">
                        <strong>{product?.name ?? "Product"}</strong>
                        <span>{variant ? `${variant.size} / ${variant.color}` : "Variant"}</span>
                        {movement.note && <small>{movement.note}</small>}
                      </div>
                      <div className="inventory-history-meta">
                        <span>{movement.movement_type.replace("_", " ")}</span>
                        <strong className={positive ? "inventory-delta-positive" : "inventory-delta-negative"}>{positive ? "+" : ""}{movement.quantity_change}</strong>
                        <time dateTime={movement.created_at}>{new Date(movement.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</time>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="admin-empty">No stock movements recorded yet. Your first restock or correction will appear here.</div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
