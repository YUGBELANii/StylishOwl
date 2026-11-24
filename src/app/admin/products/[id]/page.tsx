import { requireAdmin } from "@/lib/supabase/admin";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateProductAction } from "../actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireAdmin("/admin/products/[id]");
  const { data: product } = await supabase.from("products").select("id,name,description,base_price,compare_at_price,is_featured,slug").eq("id", id).maybeSingle();
  if (!product) notFound();
  return (
    <main className="admin-page">
      <header className="admin-page-heading"><div><p className="eyebrow eyebrow--dark">STYLISHOWL / CATALOGUE</p><h1>Edit product.</h1><p>Update product information and pricing.</p></div><Link href="/admin/products" className="text-link">← All products</Link></header>
      <section className="auth-card edit-product-card"><form action={updateProductAction} className="auth-form">
        <input type="hidden" name="id" value={product.id}/>
        <label>Product name<input name="name" required minLength={2} defaultValue={product.name}/></label>
        <label>Description<textarea name="description" rows={5} defaultValue={product.description || ""}/></label>
        <label>Selling price (₹)<input name="base_price" type="number" min="0" step="0.01" required defaultValue={product.base_price}/></label>
        <label>Compare-at price (₹)<input name="compare_at_price" type="number" min="0" step="0.01" defaultValue={product.compare_at_price || ""}/></label>
        <label className="address-default"><input type="checkbox" name="is_featured" defaultChecked={product.is_featured}/> Feature this product</label>
        <button type="submit">Save changes ↗</button>
      </form></section>
    </main>
  );
}
