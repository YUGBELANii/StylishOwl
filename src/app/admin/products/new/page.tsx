import Link from "next/link";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { requireAdmin } from "../../../lib/supabase/admin";
import { ProductForm } from "./product-form";

type Props = { searchParams: Promise<{ created?: string }> };

export default async function NewProductPage({ searchParams }: Props) {
  const { supabase } = await requireAdmin("/admin/products/new");

  const [{ data: categories, error }, params] = await Promise.all([
    supabase.from("categories").select("id, name").eq("is_active", true).order("sort_order"),
    searchParams,
  ]);

  return (
    <main className="admin-products-page">
      <div className="admin-products-top"><Link href="/"><ArrowLeft size={16} /> Back to storefront</Link><span>STYLISHOWL / ADMIN</span></div>
      <header className="admin-products-heading">
        <div className="admin-heading-icon"><PackagePlus size={20} /></div>
        <p className="eyebrow eyebrow--dark">CATALOGUE MANAGEMENT</p>
        <h1>Add a product<span>.</span></h1>
        <p>Create a new piece and its size, colour, stock and image details.</p>
      </header>
      {error ? <p className="admin-form-error">Could not load categories: {error.message}</p> :
        categories?.length ? <ProductForm categories={categories} created={params.created} /> :
        <div className="admin-empty-categories">No active categories found. Add a category before creating a product.</div>}
    </main>
  );
}
