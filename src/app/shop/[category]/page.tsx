import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product-grid";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/catalog";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);

  return {
    title: category ? `${category.name} — StylishOwl` : "Shop — StylishOwl",
    description: category?.description || `Explore the ${category?.name ?? "StylishOwl"} collection.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const products = await getProductsByCategory(category.id);

  return (
    <main className="shop-page">
      <div className="shop-breadcrumb">
        <Link href="/#collections"><ArrowLeft size={15} /> All collections</Link>
        <span>/</span>
        <span>{category.name}</span>
      </div>
      <section className="shop-heading">
        <p className="eyebrow eyebrow--dark">THE COLLECTION / {category.slug.toUpperCase()}</p>
        <h1>{category.name}<span>.</span></h1>
        <p>{category.description || "Considered everyday pieces. Find the fit that feels like you."}</p>
      </section>
      <ProductGrid products={products} />
    </main>
  );
}
