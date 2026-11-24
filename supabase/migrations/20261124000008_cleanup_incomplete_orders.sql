drop policy if exists "Customers remove own incomplete pending orders" on public.orders;
create policy "Customers remove own incomplete pending orders"
on public.orders for delete
to authenticated
using (
  user_id = (select auth.uid())
  and status = 'pending'
  and created_at > now() - interval '20 minutes'
);
