// Namuna (boshlang'ich) ma'lumotlar. Hammasini admin paneldan o'zgartirasiz.
// MUHIM: narxlar, telefon va boshqa raqamlar — NAMUNA. Haqiqiylari bilan almashtiring.
(function () {
  const L = (uz, ru, de) => ({ uz, ru, de });

  window.NEMIX_SEED = {
    settings: [{
      name: "Nemix",
      tagline: L("Nemis tili markazi", "Центр немецкого языка", "Deutschzentrum"),
      hero_title: L(
        "Germaniyada kelajagingizni Nemix bilan quring",
        "Стройте будущее в Германии вместе с Nemix",
        "Bauen Sie Ihre Zukunft in Deutschland mit Nemix"
      ),
      hero_text: L(
        "Nemis tilini noldan o'rganing, Germaniya bo'yicha bepul maslahat oling va o'qish yoki ishlash yo'lida birinchi qadamni qo'ying.",
        "Изучайте немецкий с нуля, получите бесплатную консультацию по Германии и сделайте первый шаг к учёбе или работе.",
        "Lernen Sie Deutsch von Null an, erhalten Sie eine kostenlose Beratung zu Deutschland und machen Sie den ersten Schritt zu Studium oder Arbeit."
      ),
      about: L(
        "Nemix — nemis tili o'quv markazi. Biz o'quvchilarni A1 dan C1 gacha olib boramiz, rasmiy imtihonlarga tayyorlaymiz va Germaniya bilan hamkorligimiz orqali o'qish hamda ish yo'lida yo'l-yo'riq beramiz.",
        "Nemix — учебный центр немецкого языка. Мы ведём учеников от A1 до C1, готовим к официальным экзаменам и благодаря сотрудничеству с Германией помогаем сориентироваться в вопросах учёбы и работы.",
        "Nemix ist ein Zentrum für Deutschunterricht. Wir begleiten Lernende von A1 bis C1, bereiten auf offizielle Prüfungen vor und geben durch unsere Zusammenarbeit mit Deutschland Orientierung für Studium und Beruf."
      ),
      germany_intro: L(
        "Markazimizning Germaniya bilan hamkorligi bor. Bu sizga Germaniyada o'qish, kasb o'rganish yoki ishlash yo'lida to'g'ri yo'nalish tanlashga yordam beradi.",
        "У нашего центра есть сотрудничество с Германией. Это поможет вам выбрать верное направление для учёбы, профессионального обучения или работы в Германии.",
        "Unser Zentrum arbeitet mit Partnern in Deutschland zusammen. Das hilft Ihnen, den richtigen Weg für Studium, Ausbildung oder Arbeit in Deutschland zu wählen."
      ),
      phone: "+998 94 799 97 49",
      phone2: "+998 90 799 97 90",
      telegram: "",
      channel: "nemix_nemistili",
      instagram: "nemix_nemistili",
      website: "",
      address: L("Toshkent shahri, Uchtepa tumani, 23-mavze, 55/4", "г. Ташкент, Учтепинский район, 23-й квартал, 55/4", "Taschkent, Bezirk Uchtepa, 23. Wohnviertel, 55/4"),
      hours: L("", "", ""),
      map_url: "",
      consult_minutes: 15,
      s1_num: "A1–C1", s1_label: L("Barcha darajalar", "Все уровни", "Alle Niveaus"),
      s2_num: "15'", s2_label: L("Bepul konsultatsiya", "Бесплатная консультация", "Kostenlose Beratung"),
      s3_num: "2×", s3_label: L("Online va oflayn", "Онлайн и офлайн", "Online & vor Ort")
    }],

    features: [
      { position: 1, icon: "badge", title: L("Tajribali o'qituvchilar", "Опытные преподаватели", "Erfahrene Lehrkräfte"),
        text: L("Nemis tilini professional o'qituvchilar bilan o'rganing.", "Учитесь у профессиональных преподавателей.", "Lernen Sie mit professionellen Lehrkräften.") },
      { position: 2, icon: "team", title: L("Kichik guruhlar", "Маленькие группы", "Kleine Gruppen"),
        text: L("Har bir o'quvchiga yetarli e'tibor beriladi.", "Каждому ученику уделяется достаточно внимания.", "Jede/r Lernende erhält ausreichend Aufmerksamkeit.") },
      { position: 3, icon: "online", title: L("Online va oflayn", "Онлайн и офлайн", "Online & vor Ort"),
        text: L("O'zingizga qulay formatni tanlang.", "Выберите удобный формат обучения.", "Wählen Sie das Format, das zu Ihnen passt.") },
      { position: 4, icon: "certificate", title: L("Imtihonga tayyorgarlik", "Подготовка к экзаменам", "Prüfungsvorbereitung"),
        text: L("Rasmiy imtihon formatida mashq qilasiz.", "Тренируетесь в формате официальных экзаменов.", "Sie üben im Format offizieller Prüfungen.") },
      { position: 5, icon: "globe", title: L("Germaniya hamkorligi", "Сотрудничество с Германией", "Partner in Deutschland"),
        text: L("O'qish va ish yo'lida yo'l-yo'riq olasiz.", "Получите ориентиры для учёбы и работы.", "Sie erhalten Orientierung für Studium und Beruf.") },
      { position: 6, icon: "money", title: L("Aniq narxlar", "Прозрачные цены", "Klare Preise"),
        text: L("Narxlar oldindan ma'lum va ochiq ko'rsatilgan.", "Цены известны заранее и указаны открыто.", "Die Preise sind vorab bekannt und offen angegeben.") }
    ],

    courses: [
      {
        position: 1, level: "A1", popular: true, format: "both", months: 3, lessons_week: 3, lesson_minutes: 90,
        price: 700000, price_int: 900000, price_ind: 1400000, price_ind_int: 1800000, old_price: 0, price_unit: "month",
        title: L("Nemis tili A1 — Boshlang'ich", "Немецкий A1 — Начальный", "Deutsch A1 — Anfänger"),
        short: L("Noldan boshlovchilar uchun. Asosiy so'zlashuv va grammatika.", "Для начинающих с нуля. Базовая речь и грамматика.", "Für Anfänger ohne Vorkenntnisse. Grundlegende Sprache und Grammatik."),
        description: L(
          "Nemis tilini umuman bilmaydiganlar uchun kurs. Alifbo, o'qish, talaffuz, tanishuv va kundalik oddiy iboralar bilan boshlaymiz.",
          "Курс для тех, кто совсем не знает немецкий. Начинаем с алфавита, чтения, произношения, знакомства и простых повседневных фраз.",
          "Kurs für alle ohne Vorkenntnisse. Wir beginnen mit Alphabet, Aussprache, Vorstellen und einfachen Alltagssätzen."
        ),
        outcomes: L(
          "O'zingizni tanishtira olasiz\nSon, vaqt va sanalarni ishlatasiz\nOddiy savollarga javob berasiz va savol berasiz\nDo'konda va kafeda oddiy muloqot qilasiz\nOddiy anketani to'ldira olasiz",
          "Сможете представиться\nБудете использовать числа, время и даты\nОтвечать на простые вопросы и задавать их\nПростое общение в магазине и кафе\nЗаполнять простую анкету",
          "Sie können sich vorstellen\nSie verwenden Zahlen, Uhrzeiten und Daten\nSie beantworten einfache Fragen und stellen selbst welche\nEinfache Gespräche im Geschäft und im Café\nSie füllen einfache Formulare aus"
        ),
        schedule: L("Dars jadvali guruh ochilganda kelishiladi", "Расписание согласуется при наборе группы", "Der Stundenplan wird bei Gruppenstart abgestimmt"),
        discount_note: L("", "", "")
      },
      {
        position: 2, level: "A2", popular: true, format: "both", months: 3, lessons_week: 3, lesson_minutes: 90,
        price: 700000, price_int: 900000, price_ind: 1400000, price_ind_int: 1800000, old_price: 0, price_unit: "month",
        title: L("Nemis tili A2 — Elementar", "Немецкий A2 — Элементарный", "Deutsch A2 — Grundstufe"),
        short: L("Kundalik hayotda ishonchli muloqot qilish uchun.", "Для уверенного общения в повседневной жизни.", "Für sicheres Kommunizieren im Alltag."),
        description: L(
          "A1 dan keyingi bosqich. O'tgan zamon, kundalik mavzular, sayohat, xarid va qisqa xatlar yozishni o'rganasiz.",
          "Следующий шаг после A1. Прошедшее время, бытовые темы, путешествия, покупки и короткие письма.",
          "Der nächste Schritt nach A1. Vergangenheit, Alltagsthemen, Reisen, Einkaufen und kurze Briefe."
        ),
        outcomes: L(
          "Kundalik tartibingiz haqida gapirasiz\nO'tgan voqealarni so'zlab berasiz\nQisqa xabar va elektron xat yozasiz\nSayohat va xarid vaziyatlarida o'zingizni tushuntirasiz\nOddiy matn va e'lonlarni tushunasiz",
          "Расскажете о своём распорядке дня\nРасскажете о прошедших событиях\nНапишете короткое сообщение и письмо\nОбъяснитесь в поездке и при покупках\nПоймёте простые тексты и объявления",
          "Sie sprechen über Ihren Alltag\nSie berichten über vergangene Ereignisse\nSie schreiben kurze Nachrichten und E-Mails\nSie kommen auf Reisen und beim Einkaufen zurecht\nSie verstehen einfache Texte und Anzeigen"
        ),
        schedule: L("Dars jadvali guruh ochilganda kelishiladi", "Расписание согласуется при наборе группы", "Der Stundenplan wird bei Gruppenstart abgestimmt"),
        discount_note: L("", "", "")
      },
      {
        position: 3, level: "B1", popular: true, format: "both", months: 4, lessons_week: 3, lesson_minutes: 90,
        price: 700000, price_int: 900000, price_ind: 1400000, price_ind_int: 1800000, old_price: 0, price_unit: "month",
        title: L("Nemis tili B1 — O'rta", "Немецкий B1 — Средний", "Deutsch B1 — Mittelstufe"),
        short: L("Mustaqil so'zlashuv. Ko'plab yo'nalishlar uchun asosiy daraja.", "Самостоятельная речь. Базовый уровень для многих направлений.", "Selbstständige Sprachverwendung. Für viele Wege ein wichtiges Niveau."),
        description: L(
          "Fikringizni erkin bayon qilish, tajribangiz haqida gapirish va rasmiy xatlar yozishni o'rganasiz. Ko'plab kasb ta'limi va ish yo'nalishlarida B1 darajasi so'raladi (talablar yo'nalishga qarab farq qiladi).",
          "Учитесь свободно излагать мысли, рассказывать об опыте и писать официальные письма. Во многих направлениях профобучения и работы требуется B1 (требования зависят от направления).",
          "Sie lernen, Ihre Meinung auszudrücken, über Erfahrungen zu sprechen und formelle Briefe zu schreiben. B1 wird für viele Ausbildungs- und Arbeitswege verlangt (die Anforderungen variieren)."
        ),
        outcomes: L(
          "Ish va o'qish mavzularida suhbatlashasiz\nTajriba va rejalaringiz haqida gapirasiz\nRasmiy xat va ariza yozasiz\nMurakkabroq matnlarni tushunasiz\nRasmiy B1 imtihoniga tayyor bo'lasiz",
          "Сможете беседовать на темы работы и учёбы\nРассказывать об опыте и планах\nПисать официальные письма и заявления\nПонимать более сложные тексты\nБудете готовы к официальному экзамену B1",
          "Sie führen Gespräche zu Arbeit und Studium\nSie sprechen über Erfahrungen und Pläne\nSie schreiben formelle Briefe und Bewerbungen\nSie verstehen komplexere Texte\nSie sind bereit für die offizielle B1-Prüfung"
        ),
        schedule: L("Dars jadvali guruh ochilganda kelishiladi", "Расписание согласуется при наборе группы", "Der Stundenplan wird bei Gruppenstart abgestimmt"),
        discount_note: L("", "", "")
      },
      {
        position: 4, level: "B2", popular: false, format: "both", months: 4, lessons_week: 3, lesson_minutes: 90,
        price: 700000, price_int: 900000, price_ind: 1400000, price_ind_int: 1800000, old_price: 0, price_unit: "month",
        title: L("Nemis tili B2 — Yuqori o'rta", "Немецкий B2 — Выше среднего", "Deutsch B2 — Gehobene Mittelstufe"),
        short: L("Universitet va malakali ish uchun tayyorgarlik.", "Подготовка к университету и квалифицированной работе.", "Vorbereitung auf Universität und qualifizierte Arbeit."),
        description: L(
          "Murakkab mavzularda erkin muloqot, maqola va hisobotlar yozish. Germaniyada o'qish va malakali ish rejalaringiz bo'lsa, B2 muhim bosqich.",
          "Свободное общение на сложные темы, написание статей и отчётов. Если вы планируете учёбу или квалифицированную работу в Германии, B2 — важный этап.",
          "Freie Kommunikation zu komplexen Themen, Artikel und Berichte schreiben. B2 ist ein wichtiger Schritt für Studium und qualifizierte Arbeit in Deutschland."
        ),
        outcomes: L(
          "Murakkab mavzularda bahslashasiz\nMatn va hisobotlarni batafsil yozasiz\nMedia va ilmiy matnlarni tushunasiz\nIsh suhbatlariga tayyorlanasiz\nB2 imtihoniga tayyor bo'lasiz",
          "Сможете обсуждать сложные темы\nПисать подробные тексты и отчёты\nПонимать медиа и научные тексты\nПодготовитесь к собеседованиям\nБудете готовы к экзамену B2",
          "Sie diskutieren über komplexe Themen\nSie schreiben ausführliche Texte und Berichte\nSie verstehen Medien und Fachtexte\nSie bereiten sich auf Vorstellungsgespräche vor\nSie sind bereit für die B2-Prüfung"
        ),
        schedule: L("Dars jadvali guruh ochilganda kelishiladi", "Расписание согласуется при наборе группы", "Der Stundenplan wird bei Gruppenstart abgestimmt"),
        discount_note: L("", "", "")
      },
      {
        position: 5, level: "C1", popular: false, format: "both", months: 4, lessons_week: 3, lesson_minutes: 90,
        price: 700000, price_int: 900000, price_ind: 1400000, price_ind_int: 1800000, old_price: 0, price_unit: "month",
        title: L("Nemis tili C1 — Ilg'or", "Немецкий C1 — Продвинутый", "Deutsch C1 — Fortgeschritten"),
        short: L("Akademik va professional darajada erkin muloqot.", "Свободное общение на академическом и профессиональном уровне.", "Freie Kommunikation auf akademischem und beruflichem Niveau."),
        description: L(
          "Murakkab matnlarni tushunish, fikrni aniq va nozik ifodalash, akademik yozuv. Universitet va yuqori malakali kasblar uchun.",
          "Понимание сложных текстов, точное и тонкое выражение мыслей, академическое письмо. Для университета и высококвалифицированных профессий.",
          "Komplexe Texte verstehen, sich präzise und differenziert ausdrücken, akademisch schreiben. Für Universität und hochqualifizierte Berufe."
        ),
        outcomes: L(
          "Murakkab va uzun matnlarni tushunasiz\nFikringizni erkin va aniq bayon qilasiz\nAkademik matn va taqdimotlar tayyorlaysiz\nKasbiy muhitda ishonch bilan muloqot qilasiz\nC1 imtihoniga tayyor bo'lasiz",
          "Понимаете сложные и длинные тексты\nСвободно и точно излагаете мысли\nГотовите академические тексты и презентации\nУверенно общаетесь в профессиональной среде\nБудете готовы к экзамену C1",
          "Sie verstehen anspruchsvolle, lange Texte\nSie drücken sich frei und präzise aus\nSie erstellen akademische Texte und Präsentationen\nSie kommunizieren sicher im Berufsumfeld\nSie sind bereit für die C1-Prüfung"
        ),
        schedule: L("", "", ""),
        discount_note: L("", "", "")
      }
    ],

    germany: [
      { position: 1, icon: "certificate", title: L("Universitetda o'qish", "Учёба в университете", "Studium an der Universität"),
        text: L("Germaniya universitetlariga kirish uchun odatda B2–C1 darajasi va tegishli hujjatlar kerak bo'ladi. Yo'nalish tanlashda yordam beramiz.",
                "Для поступления в немецкие университеты обычно нужен уровень B2–C1 и соответствующие документы. Поможем с выбором направления.",
                "Für deutsche Universitäten ist meist das Niveau B2–C1 und die passenden Unterlagen nötig. Wir helfen bei der Wahl des Studiengangs.") },
      { position: 2, icon: "badge", title: L("Kasb ta'limi (Ausbildung)", "Профобучение (Ausbildung)", "Berufsausbildung (Ausbildung)"),
        text: L("Nazariya va amaliyotni birlashtirgan ta'lim. Ko'pincha B1 darajasi talab qilinadi.",
                "Обучение, сочетающее теорию и практику. Часто требуется уровень B1.",
                "Eine Ausbildung verbindet Theorie und Praxis. Oft wird das Niveau B1 verlangt.") },
      { position: 3, icon: "search", title: L("Ishlash imkoniyatlari", "Возможности работы", "Arbeitsmöglichkeiten"),
        text: L("Malakali mutaxassislar uchun ish imkoniyatlari bor. Til darajasi va diplomni tan olish muhim.",
                "Для квалифицированных специалистов есть возможности трудоустройства. Важны уровень языка и признание диплома.",
                "Für Fachkräfte gibt es Arbeitsmöglichkeiten. Sprachniveau und Anerkennung des Abschlusses sind wichtig.") },
      { position: 4, icon: "phone", title: L("Bepul konsultatsiya", "Бесплатная консультация", "Kostenlose Beratung"),
        text: L("15 daqiqalik suhbatda Germaniya haqidagi barcha savollaringizga javob olasiz.",
                "За 15 минут получите ответы на все вопросы о Германии.",
                "In 15 Minuten erhalten Sie Antworten auf alle Ihre Fragen zu Deutschland.") }
    ],

    steps: [
      { position: 1, title: L("Til o'rganish", "Изучение языка", "Deutsch lernen"),
        text: L("A1 dan boshlab, maqsadingizga mos darajagacha.", "С A1 до уровня, нужного для вашей цели.", "Von A1 bis zum Niveau, das Ihr Ziel erfordert.") },
      { position: 2, title: L("Yo'nalish tanlash", "Выбор направления", "Weg wählen"),
        text: L("Universitet, Ausbildung yoki ish — maslahat bilan tanlaysiz.", "Университет, Ausbildung или работа — выбираете с консультацией.", "Universität, Ausbildung oder Arbeit — mit Beratung entscheiden.") },
      { position: 3, title: L("Hujjatlar", "Документы", "Unterlagen"),
        text: L("Kerakli hujjatlar ro'yxatini tayyorlaysiz.", "Готовите список необходимых документов.", "Sie stellen die nötigen Unterlagen zusammen.") },
      { position: 4, title: L("Imtihon", "Экзамен", "Prüfung"),
        text: L("Rasmiy til imtihonini topshirasiz.", "Сдаёте официальный языковой экзамен.", "Sie legen die offizielle Sprachprüfung ab.") },
      { position: 5, title: L("Viza va ko'chish", "Виза и переезд", "Visum & Umzug"),
        text: L("Viza jarayoni va Germaniyaga ko'chish bo'yicha yo'riqnoma.", "Помощь с визой и переездом в Германию.", "Orientierung zu Visum und Umzug nach Deutschland.") }
    ],

    news: [
      { position: 1, date: "2026-11-04", tag: L("Yangilik", "Новость", "Neuigkeit"),
        title: L("Nemix mini-ilovasi ishga tushdi!", "Мини-приложение Nemix запущено!", "Die Nemix-Mini-App ist online!"),
        text: L("Endi kurslar, narxlar va yangiliklarni Telegramning o'zida ko'rishingiz va bepul konsultatsiyaga yozilishingiz mumkin.",
                "Теперь курсы, цены и новости доступны прямо в Telegram, а на бесплатную консультацию можно записаться здесь же.",
                "Kurse, Preise und Neuigkeiten finden Sie jetzt direkt in Telegram – und die kostenlose Beratung können Sie hier buchen.") },
      { position: 2, date: "2026-11-03", tag: L("Konsultatsiya", "Консультация", "Beratung"),
        title: L("15 daqiqalik bepul konsultatsiya", "Бесплатная 15-минутная консультация", "Kostenlose 15-Minuten-Beratung"),
        text: L("Germaniya haqidagi barcha savollaringizga javob oling: o'qish, kasb ta'limi, ish va til darajalari.",
                "Получите ответы на все вопросы о Германии: учёба, профобучение, работа и уровни языка.",
                "Erhalten Sie Antworten auf alle Fragen zu Deutschland: Studium, Ausbildung, Arbeit und Sprachniveaus.") }
    ],

    vacancies: [
      { position: 1, active: true, type: "full",
        title: L("Nemis tili o'qituvchisi (namuna vakansiya)", "Преподаватель немецкого языка (пример вакансии)", "Deutschlehrer/in (Beispiel-Stelle)"),
        salary: L("Suhbat asosida", "По результатам собеседования", "Nach Vereinbarung"),
        deadline: "",
        description: L("Markazimiz jamoasiga nemis tili o'qituvchisi kerak. Bu namuna vakansiya — admin paneldan o'zgartiring yoki o'chiring.",
                       "В команду центра требуется преподаватель немецкого. Это пример вакансии — измените или удалите её в админ-панели.",
                       "Unser Team sucht eine/n Deutschlehrer/in. Dies ist eine Beispielstelle – im Admin-Panel ändern oder löschen."),
        requirements: L("Nemis tilini yaxshi bilish\nO'qitish tajribasi (afzallik)\nMas'uliyat va muloqot qobiliyati",
                        "Хорошее знание немецкого\nОпыт преподавания (приветствуется)\nОтветственность и коммуникабельность",
                        "Gute Deutschkenntnisse\nLehrerfahrung (von Vorteil)\nVerantwortungsbewusstsein und Kommunikationsstärke") }
    ],

    reviews: []
  };
})();
