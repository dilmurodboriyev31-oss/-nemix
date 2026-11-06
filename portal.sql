-- =====================================================================
-- NEMIX: O'quvchi kabineti, o'qituvchi paneli, testlar, davomat, to'lovlar
-- Supabase > SQL Editor ichiga to'liq joylab "Run" bosing (bir marta).
-- Qayta bajarish xavfsiz: mavjud ma'lumotlar o'chmaydi.
--
-- XAVFSIZLIK TAMOYILI:
--  * O'quvchi login/parolsiz kiradi (ism + telefon). Qurilmada maxfiy token saqlanadi,
--    boshqa qurilmada kirish uchun 12 belgili shaxsiy kod ishlatiladi.
--  * O'qituvchi login + parol bilan kiradi (alohida sahifa). Admin Supabase login bilan.
--  * Hech kim jadvallarni to'g'ridan-to'g'ri o'qiy olmaydi. Faqat quyidagi funksiyalar
--    orqali, faqat o'z ma'lumotini ko'radi.
--  * To'g'ri javoblar o'quvchiga javob berilgandan keyingina ko'rsatiladi.
--  * Davomat sabablari va to'lov yozuvlarini faqat admin (Supabase login) o'zgartiradi.
-- =====================================================================

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- ---------- Sozlamalar (ball tizimi) ----------
create table if not exists app_config (
  key text primary key,
  value text not null
);
insert into app_config (key, value) values
  ('bonus_stars', '300'),     -- bonus uchun kerakli yulduzcha
  ('bonus_amount', '10000'),  -- bonus miqdori (so'm)
  ('daily_cap', '30'),        -- kuniga olinadigan eng ko'p yulduzcha
  ('set_size', '10')          -- bir martalik test savollari soni
on conflict (key) do nothing;

-- ---------- Guruhlar va odamlar ----------
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text not null default 'A1' check (level in ('A1','A2','B1','B2','C1')),
  teacher_id uuid,
  schedule text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('student','teacher')),
  full_name text not null,
  login text not null unique,
  pass_hash text not null,           -- o'qituvchi paroli (o'quvchida tasodifiy, ishlatilmaydi)
  phone text,
  tg_id bigint,
  tg_username text,
  code_hash text,                    -- o'quvchining boshqa qurilmada kirish kodi (hash)
  verified boolean not null default false,  -- admin tasdiqlagan o'quvchi
  source text not null default 'admin' check (source in ('admin','self')),
  level text not null default 'A1' check (level in ('A1','A2','B1','B2','C1')),
  group_id uuid references groups(id) on delete set null,
  active boolean not null default true,
  note text,
  created_at timestamptz not null default now()
);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'groups_teacher_fk') then
    alter table groups add constraint groups_teacher_fk
      foreign key (teacher_id) references people(id) on delete set null;
  end if;
end $$;

create index if not exists people_code on people (code_hash);
create index if not exists people_phone on people (phone);

create table if not exists sessions (
  token_hash text primary key,
  person_id uuid not null references people(id) on delete cascade,
  expires_at timestamptz not null
);

create table if not exists login_attempts (
  login text primary key,
  fails int not null default 0,
  locked_until timestamptz
);

-- ---------- Davomat ----------
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  student_id uuid not null references people(id) on delete cascade,
  day date not null,
  status text not null check (status in ('present','absent','late')),
  reason text,                       -- FAQAT admin ko'radi
  marked_by uuid references people(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (student_id, day)
);

-- ---------- To'lovlar ----------
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references people(id) on delete cascade,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  amount_due int not null default 0,
  discount int not null default 0,
  amount_paid int not null default 0,
  paid_at date,
  note text,
  created_at timestamptz not null default now(),
  unique (student_id, month)
);

-- ---------- Testlar ----------
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('A1','A2','B1','B2','C1')),
  q text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4),
  answer int not null check (answer between 0 and 3),
  explain text,
  topic text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists questions_uq on questions (level, q);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references people(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  choice int not null,
  correct boolean not null,
  awarded boolean not null default false,
  created_at timestamptz not null default now(),
  unique (student_id, question_id)
);
create index if not exists answers_student_day on answers (student_id, created_at);

create table if not exists redemptions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references people(id) on delete cascade,
  stars int not null,
  amount int not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  note text,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  level text not null default 'ALL' check (level in ('ALL','A1','A2','B1','B2','C1')),
  title text not null,
  url text,
  kind text not null default 'link',
  note text,
  position int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- RLS: faqat admin (login qilgan) jadvallarni to'g'ridan-to'g'ri ishlatadi ----------
do $$
declare t text;
begin
  foreach t in array array['app_config','people','groups','attendance','payments','questions','answers','redemptions','materials'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists admin_all on %I', t);
    execute format('create policy admin_all on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;
alter table sessions enable row level security;        -- hech qanday policy yo'q
alter table login_attempts enable row level security;  -- hech qanday policy yo'q

-- ---------- Ichki yordamchi funksiyalar ----------
create or replace function _today() returns date language sql stable as $$
  select (now() at time zone 'Asia/Tashkent')::date
$$;

create or replace function _cfg(k text, d int) returns int language sql stable as $$
  select coalesce((select nullif(value, '')::int from app_config where key = k), d)
$$;

create or replace function _rand_str(n int, alpha text) returns text
language plpgsql volatile set search_path = public, extensions as $$
declare res text := ''; b bytea; i int;
begin
  b := gen_random_bytes(n);
  for i in 0 .. n - 1 loop
    res := res || substr(alpha, 1 + (get_byte(b, i) % length(alpha)), 1);
  end loop;
  return res;
end $$;

create or replace function _new_session(pid uuid, days int) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare tok text;
begin
  delete from sessions where expires_at < now();
  tok := encode(gen_random_bytes(24), 'hex');
  insert into sessions (token_hash, person_id, expires_at)
  values (encode(digest(tok, 'sha256'), 'hex'), pid, now() + make_interval(days => days));
  return tok;
end $$;

create or replace function _who(p_token text) returns people
language plpgsql security definer set search_path = public, extensions as $$
declare r people;
begin
  if p_token is null or length(p_token) < 20 then return null; end if;
  select p.* into r
    from sessions s join people p on p.id = s.person_id
   where s.token_hash = encode(digest(p_token, 'sha256'), 'hex')
     and s.expires_at > now() and p.active;
  if not found then return null; end if;
  return r;
end $$;

-- ---------- O'qituvchi kirishi (login + parol) ----------
create or replace function p_login(p_login text, p_password text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare r people; a login_attempts; lg text;
begin
  lg := left(lower(trim(coalesce(p_login, ''))), 40);
  select * into a from login_attempts where login = lg;
  if found and a.locked_until is not null then
    if a.locked_until > now() then
      return jsonb_build_object('ok', false, 'error', 'locked');
    end if;
    update login_attempts set fails = 0, locked_until = null where login = lg;
  end if;

  select * into r from people where login = lg and active and role = 'teacher';
  if not found or r.pass_hash <> crypt(coalesce(p_password, ''), r.pass_hash) then
    insert into login_attempts (login, fails) values (lg, 1)
    on conflict (login) do update set
      fails = login_attempts.fails + 1,
      locked_until = case when login_attempts.fails + 1 >= 5 then now() + interval '15 minutes' else null end;
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;

  delete from login_attempts where login = lg;
  return jsonb_build_object('ok', true, 'token', _new_session(r.id, 30), 'role', r.role, 'name', r.full_name);
end $$;

create or replace function p_logout(p_token text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
begin
  delete from sessions where token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex');
  return jsonb_build_object('ok', true);
end $$;

create or replace function t_change_password(p_token text, p_old text, p_new text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare me people;
begin
  me := _who(p_token);
  if me.id is null or me.role <> 'teacher' then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  if me.pass_hash <> crypt(coalesce(p_old, ''), me.pass_hash) then return jsonb_build_object('ok', false, 'error', 'wrong_old'); end if;
  if length(coalesce(p_new, '')) < 6 then return jsonb_build_object('ok', false, 'error', 'short'); end if;
  update people set pass_hash = crypt(p_new, gen_salt('bf')) where id = me.id;
  return jsonb_build_object('ok', true);
end $$;

-- ---------- O'quvchi: ro'yxatdan o'tish va qayta kirish (login/parolsiz) ----------
create or replace function s_register(p_name text, p_phone text, p_level text default 'A1',
                                      p_tg_id bigint default null, p_tg_username text default null) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare nm text; ph text; digits text; lvl text; pid uuid; lg text; code text; i int := 0;
        alpha constant text := 'abcdefghjkmnpqrstuvwxyz23456789';
begin
  nm := left(trim(coalesce(p_name, '')), 80);
  ph := left(trim(coalesce(p_phone, '')), 30);
  digits := regexp_replace(ph, '\D', '', 'g');
  if length(nm) < 2 or length(digits) < 9 or length(digits) > 15 then
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;
  lvl := case when p_level in ('A1','A2','B1','B2','C1') then p_level else 'A1' end;
  if (select count(*) from people where role = 'student' and regexp_replace(coalesce(phone, ''), '\D', '', 'g') = digits) >= 3 then
    return jsonb_build_object('ok', false, 'error', 'phone_limit');
  end if;
  if (select count(*) from people where source = 'self' and created_at > now() - interval '1 hour') >= 300 then
    return jsonb_build_object('ok', false, 'error', 'busy');
  end if;
  loop
    lg := 's' || _rand_str(10, alpha);
    exit when not exists (select 1 from people where login = lg);
    i := i + 1; if i > 20 then raise exception 'login'; end if;
  end loop;
  code := _rand_str(12, alpha);
  insert into people (role, full_name, login, pass_hash, phone, level, tg_id, tg_username, code_hash, verified, source)
  values ('student', nm, lg, crypt(_rand_str(24, alpha), gen_salt('bf')), ph, lvl, p_tg_id,
          nullif(left(coalesce(p_tg_username, ''), 40), ''),
          encode(digest(code, 'sha256'), 'hex'), false, 'self')
  returning id into pid;
  return jsonb_build_object('ok', true, 'token', _new_session(pid, 365), 'code', code);
end $$;

create or replace function s_restore(p_code text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare c text; r people;
begin
  c := lower(regexp_replace(coalesce(p_code, ''), '[^a-zA-Z0-9]', '', 'g'));
  if length(c) <> 12 then return jsonb_build_object('ok', false, 'error', 'invalid'); end if;
  select * into r from people where code_hash = encode(digest(c, 'sha256'), 'hex') and active and role = 'student';
  if not found then return jsonb_build_object('ok', false, 'error', 'invalid'); end if;
  return jsonb_build_object('ok', true, 'token', _new_session(r.id, 365), 'name', r.full_name);
end $$;

create or replace function s_new_code(p_token text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare me people; code text;
begin
  me := _who(p_token);
  if me.id is null or me.role <> 'student' then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  code := _rand_str(12, 'abcdefghjkmnpqrstuvwxyz23456789');
  update people set code_hash = encode(digest(code, 'sha256'), 'hex') where id = me.id;
  return jsonb_build_object('ok', true, 'code', code);
end $$;

create or replace function s_update_profile(p_token text, p_name text, p_phone text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare me people; digits text;
begin
  me := _who(p_token);
  if me.id is null or me.role <> 'student' then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  digits := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  if length(trim(coalesce(p_name, ''))) < 2 or length(digits) < 9 or length(digits) > 15 then
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;
  update people set full_name = left(trim(p_name), 80), phone = left(trim(p_phone), 30) where id = me.id;
  return jsonb_build_object('ok', true);
end $$;

-- ======================= O'QUVCHI =======================
create or replace function s_me(p_token text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  me people; g groups; tname text;
  tot int; used int; today_cnt int; streak int := 0; d date; guard int := 0;
begin
  me := _who(p_token);
  if me.id is null or me.role <> 'student' then
    return jsonb_build_object('ok', false, 'error', 'auth');
  end if;

  select * into g from groups where id = me.group_id;
  if g.id is not null then select full_name into tname from people where id = g.teacher_id; end if;

  select count(*) into tot from answers where student_id = me.id and awarded;
  select coalesce(sum(stars), 0) into used from redemptions where student_id = me.id and status <> 'rejected';
  select count(*) into today_cnt from answers
   where student_id = me.id and awarded and (created_at at time zone 'Asia/Tashkent')::date = _today();

  d := _today();
  if not exists (select 1 from answers where student_id = me.id and (created_at at time zone 'Asia/Tashkent')::date = d) then
    d := d - 1;
  end if;
  while guard < 400 and exists (select 1 from answers where student_id = me.id and (created_at at time zone 'Asia/Tashkent')::date = d) loop
    streak := streak + 1; d := d - 1; guard := guard + 1;
  end loop;

  return jsonb_build_object(
    'ok', true,
    'name', me.full_name,
    'phone', me.phone,
    'verified', me.verified,
    'level', me.level,
    'group', case when g.id is null then null else jsonb_build_object('name', g.name, 'schedule', g.schedule, 'teacher', tname) end,
    'stars', jsonb_build_object('total', tot, 'available', tot - used, 'today', today_cnt, 'cap', _cfg('daily_cap', 30)),
    'streak', streak,
    'bonus', jsonb_build_object('stars', _cfg('bonus_stars', 300), 'amount', _cfg('bonus_amount', 10000)),
    'payments', coalesce((
      select jsonb_agg(jsonb_build_object(
        'month', month, 'due', amount_due, 'discount', discount, 'paid', amount_paid,
        'status', case when amount_paid >= amount_due - discount then 'paid' when amount_paid > 0 then 'partial' else 'unpaid' end
      ) order by month desc) from payments where student_id = me.id), '[]'::jsonb),
    'att', jsonb_build_object(
      'present', (select count(*) from attendance where student_id = me.id and status = 'present' and day >= _today() - 60),
      'late',    (select count(*) from attendance where student_id = me.id and status = 'late'    and day >= _today() - 60),
      'absent',  (select count(*) from attendance where student_id = me.id and status = 'absent'  and day >= _today() - 60),
      'recent', coalesce((select jsonb_agg(jsonb_build_object('day', day, 'status', status) order by day desc)
                           from (select day, status from attendance where student_id = me.id order by day desc limit 10) x), '[]'::jsonb)
    ),
    'redemptions', coalesce((
      select jsonb_agg(jsonb_build_object('stars', stars, 'amount', amount, 'status', status, 'at', created_at) order by created_at desc)
        from redemptions where student_id = me.id), '[]'::jsonb)
  );
end $$;

create or replace function s_questions(p_token text, p_count int default null) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare me people; cnt int; cap int; n int; items jsonb; pool int;
begin
  me := _who(p_token);
  if me.id is null or me.role <> 'student' then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  cap := _cfg('daily_cap', 30);
  select count(*) into cnt from answers
   where student_id = me.id and awarded and (created_at at time zone 'Asia/Tashkent')::date = _today();
  if cnt >= cap then
    return jsonb_build_object('ok', true, 'items', '[]'::jsonb, 'capped', true, 'today', cnt, 'cap', cap, 'pool', 0);
  end if;
  n := greatest(1, least(coalesce(p_count, _cfg('set_size', 10)), 20, cap - cnt));
  select count(*) into pool from questions q
   where q.level = me.level and q.active
     and not exists (select 1 from answers a where a.student_id = me.id and a.question_id = q.id);
  select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'q', x.q, 'options', x.options, 'topic', x.topic)), '[]'::jsonb)
    into items
    from (select q.id, q.q, q.options, q.topic from questions q
           where q.level = me.level and q.active
             and not exists (select 1 from answers a where a.student_id = me.id and a.question_id = q.id)
           order by random() limit n) x;
  return jsonb_build_object('ok', true, 'items', items, 'capped', false, 'today', cnt, 'cap', cap, 'pool', pool);
end $$;

create or replace function s_answer(p_token text, p_qid uuid, p_choice int) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare me people; qu questions; cnt int; cap int; is_ok boolean; ins int;
begin
  me := _who(p_token);
  if me.id is null or me.role <> 'student' then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  if p_choice is null or p_choice < 0 or p_choice > 3 then return jsonb_build_object('ok', false, 'error', 'invalid'); end if;
  perform pg_advisory_xact_lock(hashtext(me.id::text));

  select * into qu from questions where id = p_qid and active and level = me.level;
  if not found then return jsonb_build_object('ok', false, 'error', 'noq'); end if;
  if exists (select 1 from answers where student_id = me.id and question_id = qu.id) then
    return jsonb_build_object('ok', false, 'error', 'done');
  end if;

  cap := _cfg('daily_cap', 30);
  select count(*) into cnt from answers
   where student_id = me.id and awarded and (created_at at time zone 'Asia/Tashkent')::date = _today();
  -- Limit tugagan: javob yozilmaydi va to'g'ri javob ham ko'rsatilmaydi
  if cnt >= cap then
    return jsonb_build_object('ok', true, 'capped', true, 'today', cnt, 'cap', cap);
  end if;

  is_ok := (p_choice = qu.answer);
  insert into answers (student_id, question_id, choice, correct, awarded)
  values (me.id, qu.id, p_choice, is_ok, is_ok)
  on conflict (student_id, question_id) do nothing;
  get diagnostics ins = row_count;
  if ins = 0 then return jsonb_build_object('ok', false, 'error', 'done'); end if;
  if is_ok then cnt := cnt + 1; end if;

  return jsonb_build_object('ok', true, 'capped', false, 'correct', is_ok, 'answer', qu.answer,
                            'explain', qu.explain, 'today', cnt, 'cap', cap);
end $$;

create or replace function s_materials(p_token text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare me people;
begin
  me := _who(p_token);
  if me.id is null or me.role <> 'student' then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  return jsonb_build_object('ok', true, 'items', coalesce((
    select jsonb_agg(jsonb_build_object('title', title, 'url', url, 'kind', kind, 'note', note, 'level', level) order by position, created_at)
      from materials where active and level in ('ALL', me.level)), '[]'::jsonb));
end $$;

create or replace function s_redeem(p_token text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare me people; tot int; used int; need int; amt int;
begin
  me := _who(p_token);
  if me.id is null or me.role <> 'student' then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  if not me.verified then return jsonb_build_object('ok', false, 'error', 'not_verified'); end if;
  perform pg_advisory_xact_lock(hashtext(me.id::text));
  need := _cfg('bonus_stars', 300); amt := _cfg('bonus_amount', 10000);
  select count(*) into tot from answers where student_id = me.id and awarded;
  select coalesce(sum(stars), 0) into used from redemptions where student_id = me.id and status <> 'rejected';
  if tot - used < need then return jsonb_build_object('ok', false, 'error', 'not_enough'); end if;
  if exists (select 1 from redemptions where student_id = me.id and status = 'pending') then
    return jsonb_build_object('ok', false, 'error', 'pending_exists');
  end if;
  insert into redemptions (student_id, stars, amount) values (me.id, need, amt);
  return jsonb_build_object('ok', true, 'amount', amt);
end $$;

create or replace function s_leaderboard(p_token text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare me people; since timestamptz;
begin
  me := _who(p_token);
  if me.id is null or me.role <> 'student' then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  since := date_trunc('month', now() at time zone 'Asia/Tashkent') at time zone 'Asia/Tashkent';
  return jsonb_build_object('ok', true, 'items', coalesce((
    select jsonb_agg(jsonb_build_object('name', nm, 'stars', stars, 'me', is_me) order by stars desc, nm)
      from (
        select split_part(trim(p.full_name), ' ', 1)
               || coalesce(' ' || nullif(left(split_part(trim(p.full_name), ' ', 2), 1), '') || '.', '') as nm,
               count(*) as stars, (p.id = me.id) as is_me
          from answers a join people p on p.id = a.student_id
         where a.awarded and a.created_at >= since and p.active and p.verified and p.role = 'student'
         group by p.id, p.full_name
         order by count(*) desc, p.full_name
         limit 10
      ) x), '[]'::jsonb));
end $$;

-- ======================= O'QITUVCHI =======================
create or replace function t_overview(p_token text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare me people;
begin
  me := _who(p_token);
  if me.id is null or me.role <> 'teacher' then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  return jsonb_build_object(
    'ok', true,
    'name', me.full_name,
    'today', _today(),
    'groups', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', g.id, 'name', g.name, 'level', g.level, 'schedule', g.schedule,
        'students', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.full_name, 'level', s.level) order by s.full_name)
                               from people s where s.group_id = g.id and s.role = 'student' and s.active), '[]'::jsonb)
      ) order by g.name) from groups g where g.teacher_id = me.id and g.active), '[]'::jsonb),
    'free', coalesce((
      select jsonb_agg(jsonb_build_object('id', s.id, 'name', s.full_name, 'level', s.level) order by s.full_name)
        from people s where s.role = 'student' and s.active and s.verified and s.group_id is null), '[]'::jsonb)
  );
end $$;

create or replace function t_save_group(p_token text, p_id uuid, p_name text, p_level text, p_schedule text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare me people; gid uuid;
begin
  me := _who(p_token);
  if me.id is null or me.role <> 'teacher' then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  if length(trim(coalesce(p_name, ''))) < 2 or p_level not in ('A1','A2','B1','B2','C1') then
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;
  if p_id is null then
    insert into groups (name, level, teacher_id, schedule)
    values (left(trim(p_name), 80), p_level, me.id, left(coalesce(p_schedule, ''), 200)) returning id into gid;
  else
    update groups set name = left(trim(p_name), 80), level = p_level, schedule = left(coalesce(p_schedule, ''), 200)
     where id = p_id and teacher_id = me.id and active returning id into gid;
    if gid is null then return jsonb_build_object('ok', false, 'error', 'forbidden'); end if;
  end if;
  return jsonb_build_object('ok', true, 'id', gid);
end $$;

create or replace function t_delete_group(p_token text, p_id uuid) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare me people; gid uuid;
begin
  me := _who(p_token);
  if me.id is null or me.role <> 'teacher' then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  update groups set active = false where id = p_id and teacher_id = me.id returning id into gid;
  if gid is null then return jsonb_build_object('ok', false, 'error', 'forbidden'); end if;
  update people set group_id = null where group_id = p_id;
  return jsonb_build_object('ok', true);
end $$;

create or replace function t_set_members(p_token text, p_group uuid, p_ids uuid[]) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare me people;
begin
  me := _who(p_token);
  if me.id is null or me.role <> 'teacher' then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  if not exists (select 1 from groups where id = p_group and teacher_id = me.id and active) then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;
  update people set group_id = null
   where group_id = p_group and not (id = any (coalesce(p_ids, '{}'::uuid[])));
  -- faqat guruhsiz (yoki shu guruhdagi) o'quvchilarni qo'shish mumkin
  update people set group_id = p_group
   where id = any (coalesce(p_ids, '{}'::uuid[])) and role = 'student' and active and verified
     and (group_id is null or group_id = p_group);
  return jsonb_build_object('ok', true);
end $$;

create or replace function t_att_get(p_token text, p_group uuid, p_day date) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare me people;
begin
  me := _who(p_token);
  if me.id is null or me.role <> 'teacher' then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  if not exists (select 1 from groups where id = p_group and teacher_id = me.id) then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;
  -- sabab (reason) ustozga qaytarilmaydi
  return jsonb_build_object('ok', true, 'items', coalesce((
    select jsonb_agg(jsonb_build_object('student_id', student_id, 'status', status))
      from attendance where group_id = p_group and day = p_day), '[]'::jsonb));
end $$;

create or replace function t_att_save(p_token text, p_group uuid, p_day date, p_rows jsonb) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare me people; r jsonb; sid uuid; st text; rs text; n int := 0;
begin
  me := _who(p_token);
  if me.id is null or me.role <> 'teacher' then return jsonb_build_object('ok', false, 'error', 'auth'); end if;
  if not exists (select 1 from groups where id = p_group and teacher_id = me.id and active) then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;
  if p_day is null or p_day > _today() or p_day < _today() - 30 then
    return jsonb_build_object('ok', false, 'error', 'bad_day');
  end if;
  if jsonb_typeof(p_rows) <> 'array' then return jsonb_build_object('ok', false, 'error', 'invalid'); end if;

  for r in select * from jsonb_array_elements(p_rows) loop
    begin
      sid := (r->>'student_id')::uuid;
    exception when others then
      continue;
    end;
    st := r->>'status';
    continue when st is null or st not in ('present', 'absent', 'late');
    continue when not exists (select 1 from people where id = sid and group_id = p_group and role = 'student');
    rs := nullif(left(trim(coalesce(r->>'reason', '')), 300), '');
    if st = 'present' then rs := null; end if;

    insert into attendance (group_id, student_id, day, status, reason, marked_by)
    values (p_group, sid, p_day, st, rs, me.id)
    on conflict (student_id, day) do update set
      group_id = excluded.group_id,
      status = excluded.status,
      marked_by = excluded.marked_by,
      updated_at = now(),
      -- ustoz qayta saqlaganda avval yozilgan sabab o'chib ketmasin
      reason = coalesce(excluded.reason,
                        case when excluded.status <> 'present' and attendance.status = excluded.status then attendance.reason end);
    n := n + 1;
  end loop;
  return jsonb_build_object('ok', true, 'saved', n);
end $$;

-- ======================= ADMIN (faqat Supabase login bilan) =======================
create or replace function a_create_teacher(p_name text, p_phone text) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare base text; lg text; pw text; pid uuid; i int := 0;
begin
  if auth.uid() is null then raise exception 'forbidden'; end if;
  if length(trim(coalesce(p_name, ''))) < 2 then return jsonb_build_object('ok', false, 'error', 'invalid'); end if;
  base := regexp_replace(lower(split_part(trim(p_name), ' ', 1)), '[^a-z]', '', 'g');
  if base = '' then base := 'ustoz'; end if;
  loop
    lg := left(base, 12) || (100 + floor(random() * 900))::int::text;
    exit when not exists (select 1 from people where login = lg);
    i := i + 1; if i > 50 then raise exception 'login'; end if;
  end loop;
  pw := _rand_str(8, 'abcdefghjkmnpqrstuvwxyz23456789');
  insert into people (role, full_name, login, pass_hash, phone, level, verified, source)
  values ('teacher', trim(p_name), lg, crypt(pw, gen_salt('bf')), nullif(trim(coalesce(p_phone, '')), ''), 'A1', true, 'admin')
  returning id into pid;
  return jsonb_build_object('ok', true, 'id', pid, 'login', lg, 'password', pw);
end $$;

create or replace function a_reset_password(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare pw text; lg text;
begin
  if auth.uid() is null then raise exception 'forbidden'; end if;
  pw := _rand_str(8, 'abcdefghjkmnpqrstuvwxyz23456789');
  update people set pass_hash = crypt(pw, gen_salt('bf')) where id = p_id and role = 'teacher' returning login into lg;
  if lg is null then return jsonb_build_object('ok', false, 'error', 'notfound'); end if;
  delete from sessions where person_id = p_id;
  delete from login_attempts where login = lg;
  return jsonb_build_object('ok', true, 'login', lg, 'password', pw);
end $$;

create or replace function a_create_student(p_name text, p_phone text, p_level text, p_group uuid default null) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare lg text; code text; pid uuid; i int := 0; alpha constant text := 'abcdefghjkmnpqrstuvwxyz23456789';
begin
  if auth.uid() is null then raise exception 'forbidden'; end if;
  if length(trim(coalesce(p_name, ''))) < 2 then return jsonb_build_object('ok', false, 'error', 'invalid'); end if;
  loop
    lg := 's' || _rand_str(10, alpha);
    exit when not exists (select 1 from people where login = lg);
    i := i + 1; if i > 20 then raise exception 'login'; end if;
  end loop;
  code := _rand_str(12, alpha);
  insert into people (role, full_name, login, pass_hash, phone, level, group_id, code_hash, verified, source)
  values ('student', trim(p_name), lg, crypt(_rand_str(24, alpha), gen_salt('bf')), nullif(trim(coalesce(p_phone, '')), ''),
          case when p_level in ('A1','A2','B1','B2','C1') then p_level else 'A1' end, p_group,
          encode(digest(code, 'sha256'), 'hex'), true, 'admin')
  returning id into pid;
  return jsonb_build_object('ok', true, 'id', pid, 'code', code);
end $$;

-- O'quvchiga yangi kirish kodi (eski qurilmalardagi sessiyalar yopiladi)
create or replace function a_new_code(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare code text; pid uuid;
begin
  if auth.uid() is null then raise exception 'forbidden'; end if;
  code := _rand_str(12, 'abcdefghjkmnpqrstuvwxyz23456789');
  update people set code_hash = encode(digest(code, 'sha256'), 'hex') where id = p_id and role = 'student' returning id into pid;
  if pid is null then return jsonb_build_object('ok', false, 'error', 'notfound'); end if;
  delete from sessions where person_id = p_id;
  return jsonb_build_object('ok', true, 'code', code);
end $$;

-- ---------- Funksiyalarga ruxsat ----------
revoke all on function _today(), _cfg(text, int), _who(text), _rand_str(int, text), _new_session(uuid, int)
  from public, anon, authenticated;

revoke all on function
  p_login(text, text), p_logout(text), t_change_password(text, text, text),
  s_register(text, text, text, bigint, text), s_restore(text), s_new_code(text), s_update_profile(text, text, text),
  s_me(text), s_questions(text, int), s_answer(text, uuid, int), s_materials(text), s_redeem(text), s_leaderboard(text),
  t_overview(text), t_save_group(text, uuid, text, text, text), t_delete_group(text, uuid),
  t_set_members(text, uuid, uuid[]), t_att_get(text, uuid, date), t_att_save(text, uuid, date, jsonb),
  a_create_teacher(text, text), a_reset_password(uuid), a_create_student(text, text, text, uuid), a_new_code(uuid)
from public, anon, authenticated;

grant execute on function
  p_login(text, text), p_logout(text), t_change_password(text, text, text),
  s_register(text, text, text, bigint, text), s_restore(text), s_new_code(text), s_update_profile(text, text, text),
  s_me(text), s_questions(text, int), s_answer(text, uuid, int), s_materials(text), s_redeem(text), s_leaderboard(text),
  t_overview(text), t_save_group(text, uuid, text, text, text), t_delete_group(text, uuid),
  t_set_members(text, uuid, uuid[]), t_att_get(text, uuid, date), t_att_save(text, uuid, date, jsonb)
to anon, authenticated;

grant execute on function a_create_teacher(text, text), a_reset_password(uuid), a_create_student(text, text, text, uuid), a_new_code(uuid)
  to authenticated;
