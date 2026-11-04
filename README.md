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
