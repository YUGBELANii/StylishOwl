"use server";

import { createClient } from "@/lib/supabase/server";

type CheckoutInput = {
  name: string; phone: string; email: string; address: string;
  city: string; state: string; postalCode: string; notes: string;
  items: { variantId: string; quantity: number }[];
};
type CheckoutResult = { error?: string; needsSignIn?: boolean; whatsappUrl?: string; orderNumber?: string };

export async function createWhatsAppOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const name = input.name.trim();
  const phone = input.phone.replace(/\D/g, "");
  const address = input.address.trim();
  const city = input.city.trim();
  const state = input.state.trim();
  const postalCode = input.postalCode.trim();

  if (name.length < 2 || phone.length < 10 || phone.length > 13 ||
      address.length < 8 || !city || !state || !/^\d{6}$/.test(postalCode)) {
    return { error: "Please enter a valid name, phone number and complete delivery address." };
  }
  if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 30) {
    return { error: "Your bag is empty or contains too many different products." };
  }

  const quantities = new Map<string, number>();
  for (const item of input.items) {
    if (!item.variantId || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) {
      return { error: "One or more cart quantities are invalid. Please review your bag." };
    }
    quantities.set(item.variantId, (quantities.get(item.variantId) ?? 0) + item.quantity);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in before placing an order so you can track it later.", needsSignIn: true };
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  if (!number) return { error: "The store WhatsApp number has not been configured yet. Please contact the store." };
  const variantIds = [...quantities.keys()];
  const { data: variants, error: variantError } = await supabase
    .from("product_variants")
    .select("id, sku, size, color, price, stock_quantity, product:products!inner(id, name, base_price)")
    .in("id", variantIds)
    .eq("is_active", true);

  if (variantError || !variants || variants.length !== variantIds.length) {
    return { error: "Some products are no longer available. Refresh your bag and try again." };
  }

  const rows = variants.map((variant) => {
    const product = Array.isArray(variant.product) ? variant.product[0] : variant.product;
    const quantity = quantities.get(variant.id) ?? 0;
    const price = Math.round(Number(variant.price ?? product?.base_price ?? 0) * 100) / 100;
    const lineTotal = Math.round(price * quantity * 100) / 100;
    return { variant, product, quantity, price, lineTotal };
  });

  if (rows.some((row) => !row.product || row.quantity > Number(row.variant.stock_quantity) || row.price <= 0)) {
    return { error: "Stock has changed for one or more items. Update your bag before continuing." };
  }

  const subtotal = Math.round(rows.reduce((sum, row) => sum + row.lineTotal, 0) * 100) / 100;
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      address_snapshot: {
        recipient_name: name, phone, email: input.email.trim() || user?.email || null,
        address_line1: address, city, state, postal_code: postalCode, country: "India",
      },
      subtotal,
      discount_total: 0,
      shipping_total: 0,
      grand_total: subtotal,
      status: "pending",
      payment_status: "pending",
      customer_note: input.notes.trim() || null,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return { error: "We couldn't save your order. Please try again in a moment." };
  }

  const orderItems = rows.map((row) => ({
    order_id: order.id,
    product_id: row.product.id,
    variant_id: row.variant.id,
    product_name: row.product.name,
    sku: row.variant.sku,
    size: row.variant.size,
    color: row.variant.color,
    unit_price: row.price,
    quantity: row.quantity,
    line_total: row.lineTotal,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id).eq("user_id", user.id);
    return { error: "We could not save the order items. Please refresh your bag and try again." };
  }

  const lines = [
    "Hello StylishOwl! I'd like to confirm this order.", "",
    "Order: SO-" + order.order_number,
    "Name: " + name, "Phone: " + phone,
    "Delivery: " + [address, city, state, postalCode].join(", "), "",
    ...rows.map((row) => `• ${row.product.name} — ${row.variant.size} / ${row.variant.color} × ${row.quantity} = ₹${row.lineTotal.toFixed(2)}`),
    "", "Subtotal: ₹" + subtotal.toFixed(0),
    "Total: ₹" + subtotal.toFixed(0),
    "Payment: To be arranged with the store (no online payment)",
    input.notes.trim() ? "Notes: " + input.notes.trim() : "",
  ].filter(Boolean);

  return {
    orderNumber: "SO-" + order.order_number,
    whatsappUrl: "https://wa.me/" + number + "?text=" + encodeURIComponent(lines.join("\n")),
  };
}
