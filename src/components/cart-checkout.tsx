"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useStoreCart } from "@/components/store-cart";
import { createWhatsAppOrder } from "@/app/cart/actions";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function CartCheckout() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useStoreCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [needsSignIn, setNeedsSignIn] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNeedsSignIn(false);
    setPending(true);
    const form = new FormData(event.currentTarget);
    const result = await createWhatsAppOrder({
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || ""),
      email: String(form.get("email") || ""),
      address: String(form.get("address") || ""),
      city: String(form.get("city") || ""),
      state: String(form.get("state") || ""),
      postalCode: String(form.get("postalCode") || ""),
      notes: String(form.get("notes") || ""),
      items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
    });
    setPending(false);
    if (result.error) {
      setError(result.error);
      setNeedsSignIn(Boolean(result.needsSignIn));
      if (result.orderNumber) setOrderNumber(result.orderNumber);
      return;
    }
    if (result.whatsappUrl) {
      window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      setOrderNumber(result.orderNumber || "");
      clearCart();
    }
  }

  if (!items.length && !orderNumber) {
    return <div className="commerce-empty"><ShoppingBag size={28} /><h2>Your bag is waiting.</h2><p>Explore the collection and add something you love.</p><Link className="commerce-primary-link" href="/#collections">Explore collections <ArrowRight size={16} /></Link></div>;
  }

  if (!items.length && orderNumber) {
    return <div className="commerce-success"><span>ORDER REQUEST CREATED</span><h1>One last step<span>.</span></h1><p>Your reference is <strong>{orderNumber}</strong>. WhatsApp should have opened with your order details. Send that message to confirm the request with StylishOwl.</p><Link href="/#collections" className="commerce-primary-link">Continue shopping <ArrowRight size={16} /></Link></div>;
  }

  return (
    <div className="cart-layout">
      <section className="cart-lines">
        <div className="commerce-section-heading"><span>YOUR BAG</span><small>{items.length} line items</small></div>
        {items.map((item) => (
          <article className="cart-line" key={item.variantId}>
            <div className="cart-line-image" style={item.image ? { backgroundImage: `url("${item.image}")` } : undefined}><span>SO.</span></div>
            <div className="cart-line-info">
              <Link href={`/product/${item.slug}`}>{item.name}</Link>
              <small>{item.color} / {item.size}</small>
              <strong>{money.format(item.unitPrice)}</strong>
              <div className="cart-quantity">
                <button type="button" onClick={() => updateQuantity(item.variantId, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={13} /></button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => updateQuantity(item.variantId, item.quantity + 1)} aria-label="Increase quantity"><Plus size={13} /></button>
              </div>
            </div>
            <button className="cart-remove" type="button" onClick={() => removeItem(item.variantId)} aria-label={`Remove ${item.name}`}><Trash2 size={16} /></button>
          </article>
        ))}
        <Link className="cart-continue" href="/#collections">← Continue shopping</Link>
      </section>
      <section className="cart-checkout-panel">
        <div className="commerce-section-heading"><span>DELIVERY DETAILS</span><small>Checkout via WhatsApp</small></div>
        <form className="checkout-form" onSubmit={submit}>
          <div className="checkout-fields">
            <label>Full name<input name="name" required minLength={2} autoComplete="name" placeholder="Your name" /></label>
            <label>Mobile number<input name="phone" type="tel" required minLength={10} maxLength={15} autoComplete="tel" placeholder="10-digit phone number" /></label>
            <label className="checkout-wide">Email (optional)<input name="email" type="email" autoComplete="email" placeholder="you@example.com" /></label>
            <label className="checkout-wide">Address<input name="address" required minLength={8} autoComplete="street-address" placeholder="House / flat, street, area" /></label>
            <label>City<input name="city" required autoComplete="address-level2" placeholder="City" /></label>
            <label>State<input name="state" required autoComplete="address-level1" placeholder="State" /></label>
            <label>PIN code<input name="postalCode" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="postal-code" placeholder="6-digit PIN" /></label>
            <label className="checkout-wide">Order notes (optional)<textarea name="notes" rows={3} placeholder="Any delivery instructions?" /></label>
          </div>
          <div className="checkout-totals">
            <div><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div>
            <div><span>Delivery</span><strong>Confirmed on WhatsApp</strong></div>
            <div className="checkout-grand-total"><span>Order total</span><strong>{money.format(subtotal)}*</strong></div>
            <p>*Final delivery charges and order availability will be confirmed by the store on WhatsApp.</p>
          </div>
          {error && <div className="commerce-error" role="alert">{error}{needsSignIn && <p><Link href="/account/login?next=/cart">Sign in to continue ↗</Link></p>}</div>}
          <button className="commerce-submit" type="submit" disabled={pending}>{pending ? "Preparing your order..." : "Continue to WhatsApp"} <ArrowRight size={17} /></button>
          <p className="checkout-disclaimer">No online payment is collected. Your order request is saved and sent to the store for confirmation.</p>
        </form>
      </section>
    </div>
  );
}
