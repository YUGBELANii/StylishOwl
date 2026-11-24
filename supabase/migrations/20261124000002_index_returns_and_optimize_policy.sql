create index if not exists return_requests_order_id_idx on public.return_requests(order_id);
create index if not exists return_requests_user_id_created_idx on public.return_requests(user_id, created_at desc);

drop policy if exists "Admins manage return requests" on public.return_requests;
create policy "Admins manage return requests"
on public.return_requests for all
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
