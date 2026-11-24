-- WhatsApp-first checkout and customer returns.
-- Existing catalog, profiles, addresses, carts, orders and order_items are reused.

alter table public.orders alter column user_id drop not null;

drop policy if exists "Guest and customer checkout can create pending orders" on public.orders;
create policy "Guest and customer checkout can create pending orders"
on public.orders for insert
to anon, authenticated
with check (
  status = 'pending'
  and payment_status = 'pending'
  and (
    user_id is null
    or user_id = (select auth.uid())
  )
);

drop policy if exists "Checkout can add items to pending orders" on public.order_items;
create policy "Checkout can add items to pending orders"
on public.order_items for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.status = 'pending'
      and o.created_at > now() - interval '20 minutes'
      and (o.user_id is null or o.user_id = (select auth.uid()))
  )
);

grant insert on public.orders to anon, authenticated;
grant insert on public.order_items to anon, authenticated;

create table if not exists public.return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'requested'
    check (status in ('requested','approved','rejected','received','refunded')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.return_requests enable row level security;

drop policy if exists "Users create return requests for own delivered orders" on public.return_requests;
create policy "Users create return requests for own delivered orders"
on public.return_requests for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.orders o
    where o.id = return_requests.order_id
      and o.user_id = (select auth.uid())
      and o.status = 'delivered'
  )
);

drop policy if exists "Users read own return requests" on public.return_requests;
create policy "Users read own return requests"
on public.return_requests for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Admins manage return requests" on public.return_requests;
create policy "Admins manage return requests"
on public.return_requests for all
to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

grant select, insert on public.return_requests to authenticated;
grant update, delete on public.return_requests to authenticated;
