import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getProductBySlug } from "@/lib/catalog";
import { ProductOptions } from "@/components/product-options";

type Props = { params: Promise<{ slug: string }> };
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? `${product.name} — StylishOwl` : "Product — StylishOwl", description: product?.description || "Discover the latest from StylishOwl." };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const primaryImage = [...product.images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary))[0];

  return (
    <main className="product-page">
      <div className="shop-breadcrumb"><Link href={`/shop/${product.category.slug}`}><ArrowLeft size={15} /> {product.category.name}</Link><span>/</span><span>{product.name}</span></div>
      <div className="product-detail">
        <div className="product-gallery">
          {primaryImage ? <div className="product-detail-image" style={{ backgroundImage: `url("${primaryImage.image_url}")` }} role="img" aria-label={primaryImage.alt_text || product.name} />
            : <div className="product-detail-placeholder"><span>STYLISH<span>OWL.</span></span><small>PRODUCT IMAGE COMING SOON</small></div>}
          {product.images.filter((image) => image.id !== primaryImage?.id).map((image) => <div className="product-detail-image product-detail-image--secondary" key={image.id} style={{ backgroundImage: `url("${image.image_url}")` }} role="img" aria-label={image.alt_text || product.name} />)}
        </div>
        <section className="product-detail-copy">
          <p className="eyebrow eyebrow--dark">{product.brand_label || "STYLISHOWL"} / {product.category.name.toUpperCase()}</p>
          <h1>{product.name}</h1>
          <div className="detail-price"><strong>{money.format(product.base_price)}</strong>{product.compare_at_price && product.compare_at_price > product.base_price && <del>{money.format(product.compare_at_price)}</del>}</div>
          <p className="detail-description">{product.description || "A considered addition to your everyday rotation."}</p>
          <ProductOptions variants={product.variants} basePrice={product.base_price} productId={product.id} productName={product.name} productSlug={product.slug} image={primaryImage?.image_url ?? null} />
          <div className="detail-assurance">
            <p><span>01</span> Carefully selected everyday essentials</p>
            <p><span>02</span> WhatsApp checkout · no online payment</p>
          </div>
          <Link className="text-link" href={`/shop/${product.category.slug}`}>Back to collection <ArrowUpRight size={16} /></Link>
        </section>
      </div>
    </main>
  );
}
