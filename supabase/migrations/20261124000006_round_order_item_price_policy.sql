drop policy if exists "Customers add verified items to their own pending orders" on public.order_items;
create policy "Customers add verified items to their own pending orders"
on public.order_items for insert
to authenticated
with check (
  variant_id is not null
  and product_id is not null
  and exists (
    select 1
    from public.orders o
    join public.product_variants v on v.id = order_items.variant_id
    join public.products p on p.id = v.product_id
    where o.id = order_items.order_id
      and o.user_id = (select auth.uid())
      and o.status = 'pending'
      and o.created_at > now() - interval '20 minutes'
      and v.is_active
      and p.is_active
      and order_items.product_id = p.id
      and round(order_items.unit_price, 2) = round(coalesce(v.price, p.base_price), 2)
      and order_items.line_total = round(order_items.unit_price * order_items.quantity, 2)
      and order_items.quantity <= v.stock_quantity
  )
);
