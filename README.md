# 🆕 YANGILANISH v4 — O'quvchi kabineti, ustozlar paneli, bonus tizimi

## Nimalar qo'shildi
- **O'quvchi kabineti** (pastki menyuda «Kabinet»): login/parolsiz. Ism + telefon + daraja yoziladi, ilova 12 belgili **kirish kodi** beradi (boshqa telefondan kirish uchun saqlab qo'yiladi). Ichida: guruh/ustoz/jadval, davomat, oylik to'lov holati (to'langan / qisman / to'lanmagan), kunlik test (darajasiga mos), ⭐ yig'ish, «Germaniya yo'li» (har 60 ⭐ da yangi shahar), 300 ⭐ → 10 000 so'm chegirma, kunlik reja, materiallar, oylik reyting, profil.
- **Ustozlar paneli**: `teacher.html` — alohida sahifa, login+parol bilan. Guruh yaratish, o'quvchi qo'shish, davomat va kelmagan sababini yozish. **Sababni faqat admin ko'radi.**
- **Admin**: yangi bo'limlar — Boshqaruv, O'quvchilar (tasdiqlash, kod berish), Ustoz akkauntlari, Guruhlar, Davomat (sabablar bilan), To'lovlar, Bonuslar (+ qoidalar), Savollar (+ ko'plab qo'shish), Materiallar.
- Ustoz va admin sahifalariga ilovada **hech qanday havola yo'q** — o'quvchilar ko'rmaydi. Sahifa manzillarini faqat siz bilasiz: `.../teacher.html` va `.../admin.html`.
- Sarlavha: faqat logo + til + kun/tun tugmasi. Pastki menyu 6 ta bo'lim, 320 px gacha hech narsa ustma-ust tushmaydi (sinab ko'rilgan).

## O'rnatish tartibi (muhim!)
1. **GitHub**: zipdagi barcha fayllarni yuklang. ⚠️ `js/config.js` ni **yuklamang** (sizniki Supabase kalitlari bilan turibdi) — qolganlari almashadi. Yangi fayllar: `teacher.html`, `js/portal.js`, `js/teacher.js`, `js/admin2.js`, `css/teacher.css`.
2. **Supabase → SQL Editor**, ketma-ket (har birini «New query» da ishga tushiring):
   1) `portal.sql`  2) `questions_seed.sql`  3) `supabase_update.sql` (oldin qilgan bo'lsangiz shart emas)  4) `notify.sql` (faqat Telegram bot tayyor bo'lgach).
3. Admin → «Ustoz akkauntlari» → ustoz yarating, login/parolni ustozga bering. Ustoz `teacher.html` dan kiradi.
4. «To'lovlar» → oy boshida «Oy uchun yozuv yaratish».

## Muhim eslatmalar
- Savollar bazasi: A1 293, A2 176, B1 111, B2 89, C1 63 ta (jami 732). Bonus 300 ⭐ talab qiladi, shuning uchun A2–C1 da savollar yetmasligi mumkin: admin «Savollar» bo'limidan ko'proq qo'shing yoki «Bonuslar → Qoidalar»da ⭐ sonini kamaytiring. Savollar avtomatik tuzilgan — **o'qituvchi ko'rib chiqsin**; ruscha/nemischa tarjimalar ham tekshirilsin.
- Yangi ro'yxatdan o'tgan o'quvchi admin tasdiqlamaguncha reyting, bonus va guruhga qo'shilishdan foydalana olmaydi (soxta profillardan himoya).
- Kuniga ⭐ limiti 30 (adminda o'zgartiriladi). Bonus tasdiqlanganda summa shu oydagi to'lov chegirmasiga qo'shiladi.
- Kodni yo'qotgan o'quvchiga admin «🔑» bilan yangi kod beradi.

---

# Nemix — Telegram mini app (nemis tili markazi)

Papka tarkibi: `index.html` (mijoz ilovasi), `admin.html` (admin panel), `css/`, `js/`, `images/`, `supabase.sql`.

## Hozir sinab ko'rish (DEMO)
Hech narsa sozlamasdan ishlaydi: `index.html` ni brauzerda oching (yoki `python3 -m http.server`).
Admin: `admin.html`, login `admin`, parol `nemix2026` (faqat demo).

## Haqiqiy ishga tushirish (hammasi bepul)
1. **GitHub** akkaunt oching, yangi repo yarating, shu papkadagi fayllarni yuklang.
2. Repo > Settings > Pages > Branch `main` > Save. Manzil: `https://LOGIN.github.io/REPO/`
3. **Supabase** (supabase.com, bepul): New project. SQL Editor'ga `supabase.sql` ni joylab Run.
4. Supabase > Authentication > Users > Add user: o'zingizning email va parolingiz (admin login shu).
   Authentication > Sign In / Providers > "Allow new users to sign up" ni **o'chiring**.
5. Supabase > Project Settings > API: `Project URL` va `anon public` kalitini `js/config.js` ga yozing, GitHub'ga qayta yuklang.
6. `https://LOGIN.github.io/REPO/admin.html` ga kiring > Vositalar > "Namunalarni yuklash". Keyin hamma narsani tahrirlang.
7. Telegram > @BotFather > `/newbot`, keyin `/newapp` (yoki Bot Settings > Menu Button) va sahifa manzilini kiriting.

## Eslatma
Seed (namuna) ma'lumotlardagi narxlar, telefon, vakansiya — NAMUNA. Admin paneldan haqiqiylariga almashtiring.

## Qo'shimcha sozlamalar (Supabase ulangandan keyin)

### 1. Rasm yuklash (ustozlar va natijalar uchun)
Supabase > SQL Editor ga `supabase_update.sql` ni joylab Run bosing (bir marta).
Keyin admin panelda "Ustozlar" va "Natijalar" bo'limlarida rasm yuklash ishlaydi.
Bitiruvchi rasmini faqat uning roziligi bilan qo'ying.

### 2. Yangi ariza kelganda Telegramga xabar
1. @BotFather da bot yarating, tokenni oling (tokenni hech kimga bermang).
2. Botga o'z akkauntingizdan bir marta /start yozing.
3. @userinfobot ga /start yozing, u sizning ID raqamingizni beradi.
4. `notify.sql` ni oching, `BOT_TOKEN_SHU_YERGA` va `CHAT_ID_SHU_YERGA` o'rniga o'z qiymatlaringizni yozing.
5. Supabase > SQL Editor ga joylab Run bosing. Sinash: saytda konsultatsiya arizasini yuboring.
Token faqat Supabase bazasida, yopiq jadvalda saqlanadi.

### 3. "Do'stlarga ulashish"
Bot va mini app yaratgach, admin panel > Sozlamalar > "Mini app havolasi" ga `https://t.me/BOT_NOMI/app` ni yozing.
