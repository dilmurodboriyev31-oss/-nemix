-- NEMIX: rasm yuklash uchun ombor (storage).
-- Supabase > SQL Editor ichiga joylab "Run" bosing. Bir marta bajariladi.

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Rasmlarni hamma ko'ra oladi (saytda ko'rinishi uchun)
drop policy if exists "media_read" on storage.objects;
create policy "media_read" on storage.objects for select using (bucket_id = 'media');

-- Faqat admin (login qilgan) yuklaydi, almashtiradi va o'chiradi
drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert" on storage.objects for insert to authenticated with check (bucket_id = 'media');

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects for update to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects for delete to authenticated using (bucket_id = 'media');
