-- Reserve inventory when an order is confirmed, and restore it if an unshipped
-- confirmed/packed order is cancelled. Runs in the same transaction as the status update.
create or replace function public.sync_order_inventory()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  item record;
  movement integer;
begin
  if tg_op = 'UPDATE' and old.status = 'pending' and new.status = 'confirmed' then
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

drop trigger if exists orders_sync_inventory on public.orders;
create trigger orders_sync_inventory
after update of status on public.orders
for each row
when (old.status is distinct from new.status)
execute function public.sync_order_inventory();
