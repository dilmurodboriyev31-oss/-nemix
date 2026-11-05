# NEMIX — o‘quvchi, o‘qituvchi va administrator portali

## Kirish sahifalari
- O‘quvchi kabineti: `portal.html` — login/parolsiz, lekin admin yaratadigan shaxsiy maxfiy havola/kod bilan.
- O‘qituvchi kirishi: `teacher.html` — Supabase Auth email/parol bilan.
- Administrator kirishi: `admin-login.html` (eski `admin.html` manzili ham shu sahifaga yo‘naltiradi).
- Xodim sahifalari bosh sahifada ko‘rsatilmaydi. URL'ni faqat tegishli xodimlarga yuboring. URL'ni yashirishning o‘zi xavfsizlik emas: rol server tomonda `nemix_profiles` orqali tekshiriladi.

## Portal imkoniyatlari
- O‘quvchi: daraja va guruh, yulduzlar, testlar soni, 300 test / 10 000 so‘m bonus mezoni, kunlik darajaga mos test, oylik to‘lov holati.
- O‘qituvchi: faqat o‘z guruhlarini ko‘rish/yaratish va davomat belgilash. Kelmaganlik sababi o‘qituvchi interfeysida qayta ko‘rsatilmaydi.
- Admin: o‘quvchi yaratish va shaxsiy havola berish, guruhlar, to‘lov holati, test savollari, davomat va kelmaganlik sabablarini ko‘rish.

## O‘rnatish
1. ZIP ichidagi papka tuzilishini saqlagan holda repository root'iga yuklang va mavjud fayllarni almashtiring.
2. Supabase SQL Editor'da `supabase_portal.sql` ni ko‘rib chiqib, to‘liq bir marta ishga tushiring. Skript `auth.users` ichida ko‘rsatilgan admin UUID mavjud bo‘lishini talab qiladi; bu loyiha uchun oldin berilgan UID `292d6a05-d711-4b2b-8b4b-6db30c5f74ed`.
3. Supabase Authentication → Users orqali xodimlar uchun foydalanuvchi yarating.
4. Har bir xodimga rol biriktiring. Misol (UID va ismni almashtiring):
   `insert into public.nemix_profiles(user_id,role,full_name) values('TEACHER_AUTH_UID','teacher','O‘qituvchi ismi');`
5. `js/config.js` ichida Supabase Project URL va `sb_publishable_...` kaliti to‘g‘ri ekanini tekshiring. Publishable key brauzerda bo‘lishi mumkin; `sb_secret_...`, service-role kaliti yoki DB parolini hech qachon GitHub'ga qo‘ymang.
6. GitHub Pages deploy tugagach `/portal.html`, `/teacher.html`, `/admin-login.html` manzillarini tekshiring.
7. Admin xodim panelidan o‘quvchi yaratadi. Tizim maxfiy shaxsiy havola beradi; uni faqat o‘sha o‘quvchiga shaxsiy yuboring.

## Xavfsizlik va muhim cheklovlar
- O‘quvchi parolsiz kirishi uchun shaxsiy havola bearer-token hisoblanadi. Havolaga ega odam shu kabinetni ochishi mumkin. Uni guruh chatiga yoki ommaga yubormang; yo‘qolsa, eski tokenni bekor qilish/yangi token chiqarish server funksiyasi qo‘shilishi kerak.
- Admin va o‘qituvchi rollari faqat `nemix_profiles` jadvali va server RPC tekshiruvlari bilan belgilanadi. URL'ni bilish huquq bermaydi.
- Bu ZIP — portalning boshlang‘ich funksional versiyasi. To‘lovlar qo‘lda status sifatida yuritiladi; Click/Payme integratsiyasi yo‘q. Bonus avtomatik pul to‘lovi emas, admin tasdiqlashi kerak. Kengaytirilgan darslar (audio, video, lug‘at, grammatik modul), to‘liq to‘lov tarixi, tokenni bekor qilish va ko‘p savolli test banki keyingi ishlab chiqish bosqichlari.
- Deploydan oldin test muhitida sinang va mavjud bazani zaxiralang. Eski `supabase.sql` ni qayta ishga tushirish shart emas; yangi portal uchun alohida `supabase_portal.sql` ishlatiladi.


## V2.1 — mobil dizayn va o‘quvchi kirishi
- Bosh sahifaning yuqori qismidagi suzuvchi “O‘quvchi kabineti” tugmasi olib tashlandi.
- Kabinetga kirish belgisi pastki navigatsiya paneliga joylashtirildi; til va kunduzgi/tungi rejim tugmalariga tegmaydi.
- O‘quvchi sahifasida kod kiritish maydoni olib tashlandi. O‘quvchi faqat admin yaratgan maxfiy `portal.html?student=...` shaxsiy havolasi orqali avtomatik kiradi.
- `?token=...` parametri ham moslik uchun qabul qilinadi.
- O‘quvchi, o‘qituvchi va admin portallari telefon ekranlariga moslashtirildi: navigatsiya gorizontal aylantiriladi, jadvallar o‘z ichida suriladi, formalar va tugmalar bosishga qulay.
- JS fayllari `node --check` bilan sintaksis tekshiruvidan o‘tkazildi.

### Yangilash tartibi
GitHub repository root'iga ZIP ichidagi `Nemix mini app` papkasining ICHIDAGI fayl va papkalarni yuklang (papkaning o‘zini ichma-ich joylamang), mavjud fayllarni almashtiring. GitHub Pages deploy tugagach telefon brauzerida sahifani yangilang. O‘quvchi uchun havolani admin panelidagi “O‘quvchilar” bo‘limidan yarating.
