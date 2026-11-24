import type { Metadata } from "next";
import { CartCheckout } from "@/components/cart-checkout";

export const metadata: Metadata = { title: "Your bag — StylishOwl", robots: { index: false } };

export default function CartPage() {
  return <main className="commerce-page"><div className="commerce-page-heading"><p className="eyebrow eyebrow--dark">STYLISHOWL / SHOPPING BAG</p><h1>Your bag<span>.</span></h1><p>Review your pieces and send your order request through WhatsApp.</p></div><CartCheckout /></main>;
}
