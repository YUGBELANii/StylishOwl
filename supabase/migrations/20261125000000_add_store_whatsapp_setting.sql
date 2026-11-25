-- Allow store administrators to manage the WhatsApp destination used by checkout.
create table if not exists public.store_settings (
  id text primary key default 'primary' check (id = 'primary'),
  whatsapp_number text not null default ''
    check (whatsapp_number = '' or whatsapp_number ~ '^[0-9]{8,15}$'),
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id, whatsapp_number)
values ('primary', '')
on conflict (id) do nothing;

alter table public.store_settings enable row level security;

drop policy if exists "Public can read store WhatsApp setting" on public.store_settings;
create policy "Public can read store WhatsApp setting"
on public.store_settings for select
to anon, authenticated
using (true);

drop policy if exists "Admins can update store WhatsApp setting" on public.store_settings;
create policy "Admins can update store WhatsApp setting"
on public.store_settings for update
to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

revoke all on table public.store_settings from anon, authenticated;
grant select on table public.store_settings to anon, authenticated;
grant update on table public.store_settings to authenticated;
