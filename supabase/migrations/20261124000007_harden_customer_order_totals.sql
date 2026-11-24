-- Lock customer-created orders to the unpaid WhatsApp checkout shape.
drop policy if exists "Customers create their own pending WhatsApp orders" on public.orders;
create policy "Customers create their own pending WhatsApp orders"
on public.orders for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'pending'
  and payment_status = 'pending'
  and discount_total = 0
  and shipping_total = 0
  and grand_total = subtotal
  and coupon_code is null
);

-- Validate the saved line items and order totals again before reserving inventory.
create or replace function public.sync_order_inventory()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  item record;
  order_items_total numeric;
begin
  if tg_op = 'UPDATE' and old.status = 'pending' and new.status = 'confirmed' then
    select coalesce(sum(oi.line_total), 0)
    into order_items_total
    from public.order_items oi
    where oi.order_id = new.id;

    if order_items_total <= 0 or order_items_total <> new.subtotal then
      raise exception 'Order items do not match the order subtotal';
    end if;
    if new.grand_total <> new.subtotal - new.discount_total + new.shipping_total then
      raise exception 'Order total does not match subtotal, discount and shipping';
    end if;

    for item in
      select oi.variant_id, oi.quantity
      from public.order_items oi
      where oi.order_id = new.id and oi.variant_id is not null
    loop
      update public.product_variants
      set stock_quantity = stock_quantity - item.quantity,
          updated_at = now()
      where id = item.variant_id
        and stock_quantity >= item.quantity;

      if not found then
        raise exception 'Insufficient stock for variant %', item.variant_id;
      end if;

      insert into public.inventory_movements
        (variant_id, movement_type, quantity_change, reference, note, created_by)
      values
        (item.variant_id, 'sale', -item.quantity, 'SO-' || new.order_number::text,
         'Stock reserved when order was confirmed', (select auth.uid()));
    end loop;
  elsif tg_op = 'UPDATE' and old.status in ('confirmed', 'packed') and new.status = 'cancelled' then
    for item in
      select oi.variant_id, oi.quantity
      from public.order_items oi
      where oi.order_id = new.id and oi.variant_id is not null
    loop
      update public.product_variants
      set stock_quantity = stock_quantity + item.quantity,
          updated_at = now()
      where id = item.variant_id;

      insert into public.inventory_movements
        (variant_id, movement_type, quantity_change, reference, note, created_by)
      values
        (item.variant_id, 'return', item.quantity, 'SO-' || new.order_number::text,
         'Stock restored after order cancellation', (select auth.uid()));
    end loop;
  end if;
  return new;
end;
$$;
