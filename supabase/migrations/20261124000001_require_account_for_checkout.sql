-- Keep checkout attributable to a verified customer account.
-- Guest order insertion is intentionally disabled so order items cannot be attached
-- to another customer's order through anonymous PostgREST requests.

alter table public.orders alter column user_id set not null;

drop policy if exists "Guest and customer checkout can create pending orders" on public.orders;
drop policy if exists "Checkout can add items to pending orders" on public.order_items;

create policy "Customers create their own pending WhatsApp orders"
on public.orders for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'pending'
  and payment_status = 'pending'
);

create policy "Customers add items to their own pending orders"
on public.order_items for insert
to authenticated
with check (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = (select auth.uid())
      and o.status = 'pending'
      and o.created_at > now() - interval '20 minutes'
  )
);

revoke insert on public.orders from anon;
revoke insert on public.order_items from anon;
grant insert on public.orders to authenticated;
grant insert on public.order_items to authenticated;
