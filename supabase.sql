-- NEMIX: Supabase > SQL Editor ichiga to'liq joylab, "Run" bosing.

create table if not exists content (
  id uuid primary key default gen_random_uuid(),
  collection text not null,
  position int not null default 0,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('consult','apply','review')),
  status text not null default 'new',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table content enable row level security;
alter table submissions enable row level security;

-- Kontentni hamma o'qiy oladi, faqat admin (login qilgan) o'zgartiradi
create policy "content_read" on content for select using (true);
create policy "content_admin_write" on content for all to authenticated using (true) with check (true);

-- Arizani hamma yubora oladi, lekin faqat admin ko'radi va boshqaradi
create policy "subs_insert" on submissions for insert to anon, authenticated with check (kind in ('consult','apply','review'));
create policy "subs_admin_select" on submissions for select to authenticated using (true);
create policy "subs_admin_update" on submissions for update to authenticated using (true) with check (true);
create policy "subs_admin_delete" on submissions for delete to authenticated using (true);
