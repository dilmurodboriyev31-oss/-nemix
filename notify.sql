-- NEMIX: yangi ariza kelganda Telegramga xabar yuborish.
--
-- OLDIN: 1) 'BOT_TOKEN_SHU_YERGA' ni BotFather bergan token bilan almashtiring
--        2) 'CHAT_ID_SHU_YERGA' ni o'z Telegram ID raqamingiz bilan almashtiring
--        3) Botingizga Telegram'da bir marta /start yozib qo'ying
-- KEYIN: Supabase > SQL Editor ichiga joylab "Run" bosing.
--
-- Token faqat bazada, yopiq jadvalda saqlanadi. Sayt kodida va GitHub'da turmaydi.

create extension if not exists pg_net;

create table if not exists app_secrets (
  key text primary key,
  value text not null
);
alter table app_secrets enable row level security;   -- policy yo'q: API orqali hech kim o'qiy olmaydi
revoke all on app_secrets from anon, authenticated;

insert into app_secrets (key, value) values
  ('bot_token', 'BOT_TOKEN_SHU_YERGA'),
  ('chat_id',   'CHAT_ID_SHU_YERGA')
on conflict (key) do update set value = excluded.value;

create or replace function notify_telegram() returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  tok text;
  cid text;
  msg text;
  d jsonb := new.data;
  uname text;
begin
  select value into tok from app_secrets where key = 'bot_token';
  select value into cid from app_secrets where key = 'chat_id';
  if tok is null or cid is null or tok like 'BOT_TOKEN%' or cid like 'CHAT_ID%' then
    return new;
  end if;

  uname := nullif(d->'tg_user'->>'username', '');

  if new.kind = 'consult' then
    msg := concat_ws(E'\n',
      '🗓 Yangi konsultatsiya arizasi',
      '👤 ' || (d->>'name'),
      '📞 ' || (d->>'phone'),
      case when nullif(d->>'tg','') is not null then '✈️ ' || (d->>'tg') end,
      case when uname is not null then '🔗 @' || uname end,
      case when nullif(d->>'course','') is not null then '📚 ' || (d->>'course') end,
      case when nullif(d->>'time','') is not null then '🕘 ' || (d->>'time') end,
      case when nullif(d->>'comment','') is not null then '💬 ' || (d->>'comment') end
    );
  elsif new.kind = 'apply' then
    msg := concat_ws(E'\n',
      '💼 Vakansiyaga yangi ariza',
      '📌 ' || coalesce(d->>'vacancy', ''),
      '👤 ' || (d->>'name'),
      '📞 ' || (d->>'phone'),
      case when nullif(d->>'tg','') is not null then '✈️ ' || (d->>'tg') end,
      case when uname is not null then '🔗 @' || uname end,
      case when nullif(d->>'experience','') is not null then '🧾 ' || (d->>'experience') end,
      case when nullif(d->>'cv','') is not null then '📎 ' || (d->>'cv') end
    );
  else
    msg := concat_ws(E'\n',
      '⭐ Yangi fikr (admin panelda tasdiqlang)',
      '👤 ' || (d->>'name'),
      '★ ' || coalesce(d->>'rating', '5'),
      '💬 ' || coalesce(d->>'text', '')
    );
  end if;

  perform net.http_post(
    url := 'https://api.telegram.org/bot' || tok || '/sendMessage',
    body := jsonb_build_object('chat_id', cid, 'text', msg),
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
  return new;
exception when others then
  return new;  -- xabar yuborilmasa ham ariza saqlanaversin
end;
$$;

revoke all on function notify_telegram() from public, anon, authenticated;

drop trigger if exists trg_notify on submissions;
create trigger trg_notify after insert on submissions
for each row execute function notify_telegram();
