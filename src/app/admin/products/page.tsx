import { requireAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { toggleProductAction } from "./actions";

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin("/admin/products");
  const { data: products, error } = await supabase.from("products")
    .select("id, name, slug, base_price, is_active, is_featured, created_at, category:categories(name), product_variants(stock_quantity)")
    .order("created_at", { ascending: false });
  const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><p className="eyebrow eyebrow--dark">STYLISHOWL / ADMIN</p><h1>Products.</h1><p>Manage catalogue details and storefront visibility.</p></div><Link className="commerce-primary-link" href="/admin/products/new"><Plus size={16}/> Add product</Link></header>
      {error ? <p className="commerce-error">Unable to load products.</p> : products?.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Visibility</th><th>Manage</th></tr></thead><tbody>{products.map((product) => {
        const category = Array.isArray(product.category) ? product.category[0] : product.category;
        const stock = product.product_variants.reduce((sum, variant) => sum + variant.stock_quantity, 0);
        return <tr key={product.id}><td><strong>{product.name}</strong><small className="table-subline">{product.is_featured ? "Featured · " : ""}{product.slug}</small></td><td>{category?.name || "—"}</td><td>{money.format(product.base_price)}</td><td>{stock}</td><td>{product.is_active ? "Active" : "Hidden"}</td><td><div className="table-actions"><Link href={`/admin/products/${product.id}`}>Edit</Link><form action={toggleProductAction}><input type="hidden" name="id" value={product.id}/><input type="hidden" name="active" value={String(!product.is_active)}/><button type="submit">{product.is_active ? "Hide" : "Publish"}</button></form></div></td></tr>;
      })}</tbody></table></div> : <div className="admin-empty">No products yet. Add the first product to your catalogue.</div>}
    </main>
  );
}
