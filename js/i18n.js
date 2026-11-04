// Tarjimalar (uz / ru / de) va yordamchi funksiyalar
(function () {
  const T = {
    uz: {
      tariffs: "Tariflar", t_std: "Standart guruh", t_int: "Intensiv guruh", t_ind: "Individual (standart)", t_indint: "Individual (intensiv)", from: "dan",
      tab_home: "Bosh", tab_courses: "Kurslar", tab_germany: "Germaniya", tab_news: "Yangilik", tab_contact: "Aloqa",
      btn_consult: "Bepul konsultatsiya", btn_courses: "Kurslarni ko'rish", btn_all_courses: "Barcha kurslar",
      consult_badge: "{n} daqiqa · bepul",
      popular_title: "Eng ommabop kurslar", popular_badge: "Ommabop",
      why_title: "Nega aynan Nemix?", about_title: "Markaz haqida",
      reviews_title: "O'quvchilar fikri", reviews_sub: "Bizda o'qiganlar nima deydi",
      leave_review: "Fikr qoldirish", reviews_empty: "Hali fikrlar yo'q. Birinchi bo'lib fikr qoldiring!",
      review_name: "Ismingiz", review_text: "Fikringiz", review_rating: "Baho", review_course: "Qaysi kursda o'qigansiz? (ixtiyoriy)",
      review_thanks: "Fikringiz uchun rahmat! Moderatsiyadan so'ng ko'rinadi.",
      cta_title: "Germaniya haqida savollaringiz bormi?",
      cta_text: "{n} daqiqalik bepul konsultatsiyada barcha savollaringizga javob beramiz.",
      germany_title: "Germaniyada kelajak", germany_ways: "Qanday yo'nalishlar bor?", germany_roadmap: "Germaniyaga yo'l xaritasi",
      germany_note: "Eslatma: qabul va viza qarorlarini Germaniyaning tegishli organlari qabul qiladi. Talablar yo'nalishga qarab farq qiladi — aniq ma'lumot uchun konsultatsiyaga yoziling.",
      courses_title: "Kurslarimiz", courses_sub: "Narxlar aniq, yashirin to'lovlarsiz",
      f_all: "Hammasi", f_offline: "Oflayn", f_online: "Online",
      fmt_offline: "Oflayn", fmt_online: "Online", fmt_both: "Online / Oflayn",
      per_month: "oyiga", total: "kurs uchun", currency: "so'm", off: "chegirma",
      months: "oy", lessons_week: "dars/hafta", minutes: "daq",
      duration: "Davomiyligi", schedule: "Dars jadvali", format: "Format", price: "Narx",
      outcomes: "Kursdan keyin nimalar qila olasiz", discount: "Chegirma", level: "Daraja",
      enroll: "Kursga yozilish", details: "Batafsil",
      news_title: "Yangiliklar va vakansiyalar", tab_news_list: "Yangiliklar", tab_vac_list: "Vakansiyalar",
      news_empty: "Hozircha yangiliklar yo'q.", vac_empty: "Hozircha ochiq vakansiyalar yo'q.",
      apply: "Ariza topshirish", salary: "Maosh", deadline: "Muddat", requirements: "Talablar",
      vac_full: "To'liq ish kuni", vac_part: "Yarim kun", vac_intern: "Amaliyot", vac_remote: "Masofaviy",
      contact_title: "Biz bilan bog'laning", address: "Manzil", hours: "Ish vaqti",
      call: "Qo'ng'iroq", write_tg: "Telegram'da yozish", open_map: "Xaritada ochish",
      consult_title: "Bepul konsultatsiyaga yozilish",
      consult_sub: "{n} daqiqa davom etadi. Germaniya haqidagi barcha savollarga javob beramiz.",
      f_name: "Ismingiz", f_phone: "Telefon raqamingiz", f_tg: "Telegram (ixtiyoriy)", f_course: "Qiziqtirgan kurs",
      f_course_none: "Hali bilmayman", f_time: "Qulay vaqt", f_time_ph: "Masalan: ish kunlari 15:00 dan keyin",
      f_comment: "Savolingiz (ixtiyoriy)", f_exp: "Tajribangiz haqida qisqacha", f_cv: "CV havolasi (ixtiyoriy)",
      submit: "Yuborish", sending: "Yuborilmoqda…",
      ok_title: "Arizangiz qabul qilindi!", ok_text: "Tez orada siz bilan bog'lanamiz. Rahmat!",
      err_required: "Ism va telefon raqamini to'g'ri kiriting.", err_send: "Yuborib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.",
      err_wait: "Iltimos, bir oz kutib qayta yuboring.",
      apply_title: "Vakansiyaga ariza", close: "Yopish", loading: "Yuklanmoqda…", load_err: "Ma'lumotlarni yuklab bo'lmadi.",
      demo_banner: "Demo rejim: ma'lumotlar faqat shu qurilmada saqlanadi.",
      theme: "Rejim", footer: "Barcha huquqlar himoyalangan."
    },
    ru: {
      tariffs: "Тарифы", t_std: "Стандартная группа", t_int: "Интенсивная группа", t_ind: "Индивидуально (стандарт)", t_indint: "Индивидуально (интенсив)", from: "от",
      tab_home: "Главная", tab_courses: "Курсы", tab_germany: "Германия", tab_news: "Новости", tab_contact: "Контакты",
      btn_consult: "Бесплатная консультация", btn_courses: "Смотреть курсы", btn_all_courses: "Все курсы",
      consult_badge: "{n} минут · бесплатно",
      popular_title: "Самые популярные курсы", popular_badge: "Популярно",
      why_title: "Почему именно Nemix?", about_title: "О центре",
      reviews_title: "Отзывы учеников", reviews_sub: "Что говорят те, кто у нас учился",
      leave_review: "Оставить отзыв", reviews_empty: "Пока нет отзывов. Оставьте первый!",
      review_name: "Ваше имя", review_text: "Ваш отзыв", review_rating: "Оценка", review_course: "На каком курсе вы учились? (необязательно)",
      review_thanks: "Спасибо за отзыв! Он появится после модерации.",
      cta_title: "Остались вопросы о Германии?",
      cta_text: "На бесплатной {n}-минутной консультации ответим на все ваши вопросы.",
      germany_title: "Будущее в Германии", germany_ways: "Какие есть направления?", germany_roadmap: "Дорожная карта в Германию",
      germany_note: "Примечание: решения о приёме и визе принимают соответствующие органы Германии. Требования зависят от направления — за точной информацией запишитесь на консультацию.",
      courses_title: "Наши курсы", courses_sub: "Цены прозрачные, без скрытых платежей",
      f_all: "Все", f_offline: "Офлайн", f_online: "Онлайн",
      fmt_offline: "Офлайн", fmt_online: "Онлайн", fmt_both: "Онлайн / Офлайн",
      per_month: "в месяц", total: "за курс", currency: "сум", off: "скидка",
      months: "мес.", lessons_week: "занятий/нед.", minutes: "мин",
      duration: "Длительность", schedule: "Расписание", format: "Формат", price: "Цена",
      outcomes: "Что вы сможете после курса", discount: "Скидка", level: "Уровень",
      enroll: "Записаться на курс", details: "Подробнее",
      news_title: "Новости и вакансии", tab_news_list: "Новости", tab_vac_list: "Вакансии",
      news_empty: "Пока нет новостей.", vac_empty: "Сейчас нет открытых вакансий.",
      apply: "Подать заявку", salary: "Оплата", deadline: "Срок", requirements: "Требования",
      vac_full: "Полный день", vac_part: "Неполный день", vac_intern: "Стажировка", vac_remote: "Удалённо",
      contact_title: "Свяжитесь с нами", address: "Адрес", hours: "Часы работы",
      call: "Позвонить", write_tg: "Написать в Telegram", open_map: "Открыть на карте",
      consult_title: "Запись на бесплатную консультацию",
      consult_sub: "Длится {n} минут. Ответим на все вопросы о Германии.",
      f_name: "Ваше имя", f_phone: "Номер телефона", f_tg: "Telegram (необязательно)", f_course: "Интересующий курс",
      f_course_none: "Пока не знаю", f_time: "Удобное время", f_time_ph: "Например: по будням после 15:00",
      f_comment: "Ваш вопрос (необязательно)", f_exp: "Коротко об опыте", f_cv: "Ссылка на резюме (необязательно)",
      submit: "Отправить", sending: "Отправка…",
      ok_title: "Заявка принята!", ok_text: "Мы скоро свяжемся с вами. Спасибо!",
      err_required: "Введите имя и корректный номер телефона.", err_send: "Не удалось отправить. Проверьте интернет и попробуйте снова.",
      err_wait: "Пожалуйста, подождите немного и повторите.",
      apply_title: "Заявка на вакансию", close: "Закрыть", loading: "Загрузка…", load_err: "Не удалось загрузить данные.",
      demo_banner: "Демо-режим: данные хранятся только на этом устройстве.",
      theme: "Тема", footer: "Все права защищены."
    },
    de: {
      tariffs: "Tarife", t_std: "Standardgruppe", t_int: "Intensivgruppe", t_ind: "Einzelunterricht (Standard)", t_indint: "Einzelunterricht (Intensiv)", from: "ab",
      tab_home: "Start", tab_courses: "Kurse", tab_germany: "Deutschland", tab_news: "News", tab_contact: "Kontakt",
      btn_consult: "Kostenlose Beratung", btn_courses: "Kurse ansehen", btn_all_courses: "Alle Kurse",
      consult_badge: "{n} Minuten · kostenlos",
      popular_title: "Beliebteste Kurse", popular_badge: "Beliebt",
      why_title: "Warum Nemix?", about_title: "Über uns",
      reviews_title: "Stimmen unserer Lernenden", reviews_sub: "Das sagen unsere Absolventen",
      leave_review: "Bewertung schreiben", reviews_empty: "Noch keine Bewertungen. Schreiben Sie die erste!",
      review_name: "Ihr Name", review_text: "Ihre Bewertung", review_rating: "Bewertung", review_course: "In welchem Kurs waren Sie? (optional)",
      review_thanks: "Danke für Ihr Feedback! Es erscheint nach der Prüfung.",
      cta_title: "Fragen zu Deutschland?",
      cta_text: "In der kostenlosen {n}-Minuten-Beratung beantworten wir alle Ihre Fragen.",
      germany_title: "Zukunft in Deutschland", germany_ways: "Welche Wege gibt es?", germany_roadmap: "Roadmap nach Deutschland",
      germany_note: "Hinweis: Über Zulassung und Visum entscheiden die zuständigen Behörden in Deutschland. Die Anforderungen variieren – für genaue Infos buchen Sie eine Beratung.",
      courses_title: "Unsere Kurse", courses_sub: "Klare Preise, keine versteckten Kosten",
      f_all: "Alle", f_offline: "Vor Ort", f_online: "Online",
      fmt_offline: "Vor Ort", fmt_online: "Online", fmt_both: "Online / Vor Ort",
      per_month: "pro Monat", total: "für den Kurs", currency: "UZS", off: "Rabatt",
      months: "Mon.", lessons_week: "Termine/Woche", minutes: "Min.",
      duration: "Dauer", schedule: "Stundenplan", format: "Format", price: "Preis",
      outcomes: "Was Sie nach dem Kurs können", discount: "Rabatt", level: "Niveau",
      enroll: "Für den Kurs anmelden", details: "Details",
      news_title: "News & Stellen", tab_news_list: "News", tab_vac_list: "Stellen",
      news_empty: "Noch keine Neuigkeiten.", vac_empty: "Derzeit keine offenen Stellen.",
      apply: "Bewerben", salary: "Vergütung", deadline: "Frist", requirements: "Anforderungen",
      vac_full: "Vollzeit", vac_part: "Teilzeit", vac_intern: "Praktikum", vac_remote: "Remote",
      contact_title: "Kontakt", address: "Adresse", hours: "Öffnungszeiten",
      call: "Anrufen", write_tg: "Auf Telegram schreiben", open_map: "Auf Karte öffnen",
      consult_title: "Kostenlose Beratung buchen",
      consult_sub: "Dauert {n} Minuten. Wir beantworten alle Fragen zu Deutschland.",
      f_name: "Ihr Name", f_phone: "Telefonnummer", f_tg: "Telegram (optional)", f_course: "Gewünschter Kurs",
      f_course_none: "Weiß ich noch nicht", f_time: "Bevorzugte Zeit", f_time_ph: "z. B. werktags nach 15:00",
      f_comment: "Ihre Frage (optional)", f_exp: "Kurz zu Ihrer Erfahrung", f_cv: "Link zum Lebenslauf (optional)",
      submit: "Absenden", sending: "Wird gesendet…",
      ok_title: "Anfrage erhalten!", ok_text: "Wir melden uns in Kürze. Vielen Dank!",
      err_required: "Bitte Name und gültige Telefonnummer eingeben.", err_send: "Senden fehlgeschlagen. Bitte Internet prüfen und erneut versuchen.",
      err_wait: "Bitte kurz warten und erneut senden.",
      apply_title: "Bewerbung auf die Stelle", close: "Schließen", loading: "Lädt…", load_err: "Daten konnten nicht geladen werden.",
      demo_banner: "Demo-Modus: Daten werden nur auf diesem Gerät gespeichert.",
      theme: "Design", footer: "Alle Rechte vorbehalten."
    }
  };

  const LANGS = ["uz", "ru", "de"];
  const LOCALES = { uz: "uz-UZ", ru: "ru-RU", de: "de-DE" };
  let lang = "uz";

  const I18N = {
    LANGS,
    get lang() { return lang; },
    set(l) { lang = LANGS.includes(l) ? l : "uz"; document.documentElement.lang = lang; },
    t(key, vars) {
      let s = (T[lang] && T[lang][key]) || T.uz[key] || key;
      if (vars) Object.keys(vars).forEach((k) => (s = s.replace("{" + k + "}", vars[k])));
      return s;
    },
    // {uz,ru,de} obyektidan joriy tildagi matnni oladi (bo'sh bo'lsa uz, keyin boshqasi)
    tr(v) {
      if (v == null) return "";
      if (typeof v === "string") return v;
      return v[lang] || v.uz || v.ru || v.de || "";
    },
    price(n) {
      const num = Number(n) || 0;
      return String(Math.round(num)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " " + I18N.t("currency");
    },
    date(iso) {
      if (!iso) return "";
      const d = new Date(iso);
      if (isNaN(d)) return iso;
      return d.toLocaleDateString(LOCALES[lang], { day: "numeric", month: "long", year: "numeric" });
    },
    lines(v) {
      return I18N.tr(v).split("\n").map((s) => s.trim()).filter(Boolean);
    }
  };

  window.I18N = I18N;
})();
