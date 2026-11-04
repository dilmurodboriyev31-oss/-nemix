# NEMIX — yangi o‘quvchi / o‘qituvchi / admin portali

## Nimalar qo‘shildi
- `portal.html`: uch rol uchun yangi portal.
- O‘quvchi login/parolsiz kiradi: admin yaratgan maxfiy shaxsiy havola/kod orqali. Bu oddiy umumiy havola emas; har o‘quvchiga alohida tasodifiy token beriladi.
- O‘quvchi kabinetida daraja, guruh, testlar soni, yulduzlar va joriy to‘lov holati.
- Kunlik testlar A1/A2/B1 darajalari bo‘yicha; to‘g‘ri javoblar yulduz beradi.
- 300 ta test bajarish — 10 000 so‘m kurs bonusi mezoni (hozircha admin tomonidan tasdiqlanadigan jarayon sifatida ko‘zda tutilgan).
- O‘qituvchi email/parol bilan kiradi, guruh yaratadi va o‘z guruhiga davomat belgilaydi.
- Kelmaganlik sababi bazada saqlanadi; o‘qituvchi panelida ko‘rsatilmaydi, admin dashboard RPC javobida mavjud.
- Admin o‘quvchi yaratadi, shaxsiy havola oladi, guruhlar/o‘quvchilar/to‘lov holatlarini ko‘radi va test savollarini qo‘shadi.

## O‘rnatish
1. ZIP ichidagi barcha fayllarni GitHub repository root'iga yuklang (papka tuzilishini saqlang), mavjud fayllarni almashtiring.
2. Supabase → SQL Editor'da `supabase_portal.sql` faylini to‘liq ishga tushiring. Bu eski `content` va `submissions` jadvallarini o‘chirmaydi.
3. Admin Auth UID skriptda oldin bergan UID bilan biriktirilgan. Agar boshqa loyiha bo‘lsa, SQL oxiridagi UID'ni almashtiring.
4. Supabase → Authentication → Users orqali o‘qituvchilar uchun Auth user yarating.
5. Har bir o‘qituvchi uchun SQL Editor'da quyidagini bajaring (UID va ismni almashtiring):
   `insert into public.nemix_profiles(user_id,role,full_name) values('TEACHER_AUTH_UID','teacher','O‘qituvchi ismi');`
6. Saytni oching: `https://dilmurodboriyev31-oss.github.io/-nemix/portal.html`
7. Admin/xodim email va parol bilan kiradi. Admin `O‘quvchilar` bo‘limidan o‘quvchi yaratadi; hosil bo‘lgan maxfiy havolani o‘quvchiga shaxsiy yuboradi.

## Muhim xavfsizlik
- `sb_publishable_...` kaliti frontend uchun mo‘ljallangan. `sb_secret_...`, service-role kaliti yoki DB parolini hech qachon GitHub'ga joylamang.
- O‘quvchining shaxsiy URL'i uning kirish kalitidir. Uni ommaga yoki guruh chatiga yubormang. Yo‘qolsa, admin yangi token yaratishi (hozirgi versiyada yangi o‘quvchi profili yaratish) kerak.
- O‘quvchilar umumiy portal sahifasiga kodsiz kira olmaydi; bu shaxsiy natija va to‘lov ma’lumotlarini himoya qilish uchun zarur.
- Bu versiya ishga tushirish uchun boshlang‘ich modul. Haqiqiy to‘lov provayderi, bonusni pul sifatida avtomatik chegirish, test bankini kengaytirish, ota-ona kabineti va o‘qituvchiga guruh biriktirish UI keyingi bosqichda qo‘shilishi kerak.
