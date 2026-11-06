// O'quvchi shaxsiy kabineti (login/parolsiz). Ma'lumotlar Supabase RPC orqali.
(function () {
  const LS_T = "nemix_stoken";
  const LS_DONE = "nemix_plan_";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} };
  const money = (n) => Number(n || 0).toLocaleString("ru-RU").replace(/,/g, " ");

  const D = {
    title: { uz: "Shaxsiy kabinet", ru: "Личный кабинет", de: "Mein Konto" },
    wsub: { uz: "Login va parolsiz. Ism va telefon yetarli — testlar yeching, ⭐ yig'ing, bonus oling.", ru: "Без логина и пароля. Достаточно имени и телефона — решайте тесты, копите ⭐, получайте бонус.", de: "Ohne Login und Passwort. Name und Telefon genügen — Tests lösen, ⭐ sammeln, Bonus erhalten." },
    name: { uz: "Ism-familiya", ru: "Имя и фамилия", de: "Vor- und Nachname" },
    phone: { uz: "Telefon raqam", ru: "Номер телефона", de: "Telefonnummer" },
    level: { uz: "Darajangiz", ru: "Ваш уровень", de: "Dein Niveau" },
    start: { uz: "Boshlash", ru: "Начать", de: "Los geht's" },
    have: { uz: "Kodim bor (boshqa qurilma)", ru: "У меня есть код (другое устройство)", de: "Ich habe einen Code" },
    code: { uz: "Kirish kodi", ru: "Код входа", de: "Zugangscode" },
    enter: { uz: "Kirish", ru: "Войти", de: "Anmelden" },
    back: { uz: "Orqaga", ru: "Назад", de: "Zurück" },
    bad: { uz: "Ma'lumot noto'g'ri", ru: "Неверные данные", de: "Ungültige Eingabe" },
    badcode: { uz: "Kod topilmadi", ru: "Код не найден", de: "Code nicht gefunden" },
    plimit: { uz: "Bu raqam bilan juda ko'p profil ochilgan. Markazga murojaat qiling.", ru: "На этот номер создано слишком много профилей. Обратитесь в центр.", de: "Zu viele Profile mit dieser Nummer. Bitte das Zentrum kontaktieren." },
    busy: { uz: "Hozir band, birozdan so'ng urinib ko'ring", ru: "Сейчас занято, попробуйте позже", de: "Gerade ausgelastet, später erneut versuchen" },
    net: { uz: "Aloqa xatosi. Qayta urinib ko'ring.", ru: "Ошибка связи. Попробуйте ещё раз.", de: "Verbindungsfehler. Bitte erneut versuchen." },
    demo: { uz: "Kabinet faqat Supabase ulangan ilovada ishlaydi.", ru: "Кабинет работает только при подключённом Supabase.", de: "Das Konto funktioniert nur mit Supabase." },
    savecode: { uz: "Kodingizni saqlang!", ru: "Сохраните код!", de: "Code speichern!" },
    savecode_t: { uz: "Boshqa telefon yoki yangi qurilmadan kirish uchun shu kod kerak bo'ladi. Skrinshot qiling yoki yozib qo'ying.", ru: "Этот код нужен для входа с другого телефона или устройства. Сделайте скриншот или запишите.", de: "Mit diesem Code meldest du dich auf einem anderen Gerät an. Mach einen Screenshot oder schreib ihn auf." },
    copy: { uz: "Nusxa olish", ru: "Копировать", de: "Kopieren" },
    copied: { uz: "Nusxalandi", ru: "Скопировано", de: "Kopiert" },
    saved: { uz: "Saqladim, davom etaman", ru: "Сохранил(а), продолжить", de: "Gespeichert, weiter" },
    t_home: { uz: "Asosiy", ru: "Главная", de: "Start" },
    t_test: { uz: "Test", ru: "Тест", de: "Test" },
    t_pay: { uz: "To'lov", ru: "Оплата", de: "Zahlung" },
    t_learn: { uz: "O'rganish", ru: "Учёба", de: "Lernen" },
    t_top: { uz: "Reyting", ru: "Рейтинг", de: "Rangliste" },
    unver: { uz: "Profilingiz markaz tomonidan tasdiqlanishi kutilmoqda. Tasdiqlangach reyting va bonus ochiladi.", ru: "Ожидает подтверждения центром. После подтверждения откроются рейтинг и бонус.", de: "Dein Profil wartet auf Bestätigung durch das Zentrum. Danach sind Rangliste und Bonus freigeschaltet." },
    ver: { uz: "Tasdiqlangan", ru: "Подтверждён", de: "Bestätigt" },
    stars: { uz: "yulduzcha", ru: "звёзд", de: "Sterne" },
    avail: { uz: "Hisobingizda", ru: "На счёте", de: "Guthaben" },
    today: { uz: "Bugun", ru: "Сегодня", de: "Heute" },
    streak: { uz: "Ketma-ket kun", ru: "Дней подряд", de: "Tage in Folge" },
    group: { uz: "Guruhim", ru: "Моя группа", de: "Meine Gruppe" },
    nogroup: { uz: "Hali guruhga biriktirilmagansiz. Markaz sizni guruhga qo'shadi.", ru: "Вы пока не в группе. Центр добавит вас в группу.", de: "Du bist noch keiner Gruppe zugeordnet." },
    teacher: { uz: "Ustoz", ru: "Преподаватель", de: "Lehrkraft" },
    sched: { uz: "Dars jadvali", ru: "Расписание", de: "Stundenplan" },
    att: { uz: "Davomat (60 kun)", ru: "Посещаемость (60 дней)", de: "Anwesenheit (60 Tage)" },
    present: { uz: "Keldi", ru: "Был", de: "Da" },
    late: { uz: "Kechikdi", ru: "Опоздал", de: "Spät" },
    absent: { uz: "Kelmadi", ru: "Не был", de: "Fehlt" },
    route: { uz: "Germaniya yo'li", ru: "Путь в Германию", de: "Weg nach Deutschland" },
    route_t: { uz: "Har 60 ⭐ da yangi shaharga yetib borasiz.", ru: "Каждые 60 ⭐ — новый город.", de: "Alle 60 ⭐ erreichst du eine neue Stadt." },
    bonus: { uz: "Bonus", ru: "Бонус", de: "Bonus" },
    bonus_t: { uz: "{n} ⭐ to'plang va kurs to'lovidan {m} so'm chegirma oling.", ru: "Соберите {n} ⭐ и получите скидку {m} сум на оплату курса.", de: "Sammle {n} ⭐ und erhalte {m} so'm Rabatt auf die Kursgebühr." },
    redeem: { uz: "Bonusga almashtirish", ru: "Обменять на бонус", de: "Gegen Bonus einlösen" },
    redeemed: { uz: "So'rov yuborildi! Markaz tasdiqlagach chegirma to'lovingizga qo'shiladi.", ru: "Заявка отправлена! После подтверждения скидка добавится к оплате.", de: "Anfrage gesendet! Nach Bestätigung wird der Rabatt verrechnet." },
    need_more: { uz: "Yetarli ⭐ yo'q", ru: "Недостаточно ⭐", de: "Nicht genug ⭐" },
    need_ver: { uz: "Avval profil tasdiqlanishi kerak", ru: "Сначала нужно подтверждение профиля", de: "Profil muss zuerst bestätigt werden" },
    pending: { uz: "Oldingi so'rov ko'rib chiqilmoqda", ru: "Предыдущая заявка рассматривается", de: "Vorherige Anfrage wird geprüft" },
    st_pending: { uz: "Kutilmoqda", ru: "Ожидает", de: "Offen" },
    st_approved: { uz: "Tasdiqlandi", ru: "Одобрено", de: "Genehmigt" },
    st_rejected: { uz: "Rad etildi", ru: "Отклонено", de: "Abgelehnt" },
    daily: { uz: "Kunlik test", ru: "Тест дня", de: "Tagestest" },
    daily_t: { uz: "{lv} darajasiga mos savollar. To'g'ri javob = 1 ⭐.", ru: "Вопросы уровня {lv}. Верный ответ = 1 ⭐.", de: "Fragen für Niveau {lv}. Richtige Antwort = 1 ⭐." },
    go: { uz: "Testni boshlash", ru: "Начать тест", de: "Test starten" },
    next: { uz: "Keyingisi", ru: "Дальше", de: "Weiter" },
    finish: { uz: "Yakunlash", ru: "Завершить", de: "Beenden" },
    ok: { uz: "To'g'ri! +1 ⭐", ru: "Верно! +1 ⭐", de: "Richtig! +1 ⭐" },
    no: { uz: "Noto'g'ri", ru: "Неверно", de: "Falsch" },
    right_is: { uz: "To'g'ri javob", ru: "Правильный ответ", de: "Richtige Antwort" },
    capped: { uz: "Bugungi ⭐ limiti tugadi ({n}). Ertaga yangi savollar sizni kutadi!", ru: "Дневной лимит ⭐ исчерпан ({n}). Завтра — новые вопросы!", de: "Tageslimit erreicht ({n} ⭐). Morgen gibt es neue Fragen!" },
    empty: { uz: "Bu darajadagi savollar tugadi. Yangi savollar qo'shilishini kuting.", ru: "Вопросы этого уровня закончились. Скоро добавим новые.", de: "Für dieses Niveau gibt es keine neuen Fragen mehr." },
    result: { uz: "Natija", ru: "Результат", de: "Ergebnis" },
    pay_t: { uz: "Oylik to'lovlar", ru: "Ежемесячные платежи", de: "Monatliche Zahlungen" },
    nopay: { uz: "Hozircha to'lov yozuvlari yo'q.", ru: "Записей об оплате пока нет.", de: "Noch keine Zahlungen erfasst." },
    paid: { uz: "To'langan", ru: "Оплачено", de: "Bezahlt" },
    partial: { uz: "Qisman", ru: "Частично", de: "Teilweise" },
    unpaid: { uz: "To'lanmagan", ru: "Не оплачено", de: "Offen" },
    due: { uz: "To'lov", ru: "К оплате", de: "Betrag" },
    disc: { uz: "Chegirma", ru: "Скидка", de: "Rabatt" },
    paidamt: { uz: "To'langan", ru: "Оплачено", de: "Gezahlt" },
    left: { uz: "Qoldi", ru: "Осталось", de: "Rest" },
    plan: { uz: "Bugungi reja", ru: "План на сегодня", de: "Heutiger Plan" },
    mats: { uz: "Materiallar", ru: "Материалы", de: "Materialien" },
    nomats: { uz: "Materiallar tez orada qo'shiladi.", ru: "Материалы скоро появятся.", de: "Materialien folgen bald." },
    open: { uz: "Ochish", ru: "Открыть", de: "Öffnen" },
    top_t: { uz: "Shu oy eng ko'p ⭐ yig'ganlar", ru: "Больше всего ⭐ в этом месяце", de: "Die meisten ⭐ in diesem Monat" },
    notop: { uz: "Reyting hali bo'sh. Birinchi bo'ling!", ru: "Рейтинг пока пуст. Станьте первым!", de: "Noch keine Einträge. Sei der Erste!" },
    prof: { uz: "Profil", ru: "Профиль", de: "Profil" },
    save: { uz: "Saqlash", ru: "Сохранить", de: "Speichern" },
    newcode: { uz: "Yangi kirish kodi olish", ru: "Получить новый код входа", de: "Neuen Code erzeugen" },
    logout: { uz: "Bu qurilmadan chiqish", ru: "Выйти на этом устройстве", de: "Auf diesem Gerät abmelden" },
    logout_q: { uz: "Chiqsangiz, qayta kirish uchun kod kerak bo'ladi. Chiqasizmi?", ru: "После выхода понадобится код для входа. Выйти?", de: "Zum erneuten Anmelden brauchst du den Code. Abmelden?" },
    loading: { uz: "Yuklanmoqda…", ru: "Загрузка…", de: "Lädt…" }
  };
  const PLAN = {
    uz: ["Kunlik testni yeching (10 ta savol)", "5 ta yangi so'z yodlang va gap tuzing", "10 daqiqa nemischa audio/video tinglang", "Darsdagi mavzuni 15 daqiqa takrorlang", "Bitta gapni nemischa yozing"],
    ru: ["Решите тест дня (10 вопросов)", "Выучите 5 новых слов и составьте предложения", "10 минут слушайте немецкое аудио/видео", "Повторите тему урока 15 минут", "Напишите одно предложение по-немецки"],
    de: ["Tagestest lösen (10 Fragen)", "5 neue Wörter lernen und Sätze bilden", "10 Minuten deutsches Audio/Video hören", "Unterrichtsthema 15 Minuten wiederholen", "Einen Satz auf Deutsch schreiben"]
  };
  const CITIES = ["Berlin", "München", "Hamburg", "Köln", "Frankfurt"];
  const LEVELS = ["A1", "A2", "B1", "B2", "C1"];
  const MONTHS = { uz: ["yan", "fev", "mar", "apr", "may", "iyun", "iyul", "avg", "sen", "okt", "noy", "dek"], ru: ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"], de: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"] };

  const L = () => (window.I18N && I18N.lang) || "uz";
  const p = (k, v) => {
    let s = (D[k] && (D[k][L()] || D[k].uz)) || k;
    if (v) Object.keys(v).forEach((x) => (s = s.replace("{" + x + "}", v[x])));
    return s;
  };
  const monthName = (ym) => { const [y, m] = String(ym).split("-"); return (MONTHS[L()] || MONTHS.uz)[Number(m) - 1] + " " + y; };

  const St = { host: null, me: null, tab: "home", quiz: null, view: "welcome", newCode: null, busy: false, err: "" };
  const token = () => lsGet(LS_T);

  async function call(fn, args) {
    try { return await DB.rpc(fn, args); } catch (e) { return { ok: false, error: "net" }; }
  }
  function toast(m) { const el = document.createElement("div"); el.className = "toast"; el.textContent = m; document.body.appendChild(el); setTimeout(() => el.remove(), 2200); }
  function tgInfo() {
    try { const u = window.Telegram.WebApp.initDataUnsafe.user; return u ? { id: u.id, un: u.username || null } : {}; } catch (e) { return {}; }
  }
  const errText = (e) => (e === "phone_limit" ? p("plimit") : e === "busy" ? p("busy") : e === "net" ? p("net") : e === "invalid" ? p("bad") : p("bad"));

  // ---------- Kirish oynasi ----------
  function welcome() {
    if (DB.mode === "demo") return `<div class="pt-wrap"><div class="pt-hero"><div class="pt-emoji">🔒</div><h2>${esc(p("title"))}</h2><p>${esc(p("demo"))}</p></div></div>`;
    const lv = LEVELS.map((l) => `<option value="${l}">${l}</option>`).join("");
    if (St.view === "restore") {
      return `<div class="pt-wrap"><div class="pt-hero"><div class="pt-emoji">🔑</div><h2>${esc(p("have"))}</h2></div>
        <form class="card pt-card" data-pform="restore">
          <div class="field"><label>${esc(p("code"))}</label><input name="code" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="20" placeholder="xxxx xxxx xxxx" required /></div>
          ${St.err ? `<div class="pt-err">${esc(St.err)}</div>` : ""}
          <button class="btn btn-primary btn-block" ${St.busy ? "disabled" : ""}>${esc(p("enter"))}</button>
          <button type="button" class="btn btn-ghost btn-block" data-p="view" data-v="welcome" style="margin-top:8px">${esc(p("back"))}</button>
        </form></div>`;
    }
    return `<div class="pt-wrap"><div class="pt-hero"><div class="pt-emoji">⭐</div><h2>${esc(p("title"))}</h2><p>${esc(p("wsub"))}</p></div>
      <form class="card pt-card" data-pform="register">
        <div class="field"><label>${esc(p("name"))}</label><input name="name" autocomplete="name" maxlength="80" required /></div>
        <div class="field"><label>${esc(p("phone"))}</label><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+998 90 123 45 67" maxlength="30" required /></div>
        <div class="field"><label>${esc(p("level"))}</label><select name="level">${lv}</select></div>
        ${St.err ? `<div class="pt-err">${esc(St.err)}</div>` : ""}
        <button class="btn btn-primary btn-block" ${St.busy ? "disabled" : ""}>${esc(p("start"))}</button>
      </form>
      <button class="pt-link" data-p="view" data-v="restore">${esc(p("have"))}</button></div>`;
  }

  function codeScreen() {
    const c = St.newCode.match(/.{1,4}/g).join(" ");
    return `<div class="pt-wrap"><div class="pt-hero"><div class="pt-emoji">🔐</div><h2>${esc(p("savecode"))}</h2><p>${esc(p("savecode_t"))}</p></div>
      <div class="card pt-card"><div class="pt-code">${esc(c)}</div>
        <button class="btn btn-ghost btn-block" data-p="copycode">${esc(p("copy"))}</button>
        <button class="btn btn-primary btn-block" data-p="codedone" style="margin-top:8px">${esc(p("saved"))}</button></div></div>`;
  }

  // ---------- Kabinet ----------
  function cabinet() {
    const m = St.me;
    const tabs = [["home", "t_home"], ["test", "t_test"], ["pay", "t_pay"], ["learn", "t_learn"], ["top", "t_top"]];
    const ini = esc((m.name || "?").trim().charAt(0).toUpperCase());
    return `<div class="pt-wrap">
      <div class="card pt-me"><div class="pt-av">${ini}</div>
        <div class="pt-me-t"><b>${esc(m.name)}</b><span>${m.verified ? "✅ " + esc(p("ver")) : "⏳ " + esc(p("st_pending"))}</span></div>
        <span class="lvl pt-lvl">${esc(m.level)}</span></div>
      ${m.verified ? "" : `<div class="pt-note">⏳ ${esc(p("unver"))}</div>`}
      <div class="pt-tabs" role="tablist">${tabs.map(([id, k]) => `<button class="pt-tab ${St.tab === id ? "on" : ""}" data-p="tab" data-v="${id}">${esc(p(k))}</button>`).join("")}</div>
      <div id="pt-body">${body()}</div></div>`;
  }
  function body() {
    return ({ home: tHome, test: tTest, pay: tPay, learn: tLearn, top: tTop }[St.tab] || tHome)();
  }

  function statBox(v, l) { return `<div class="pt-stat"><b>${v}</b><span>${esc(l)}</span></div>`; }

  function tHome() {
    const m = St.me, s = m.stars, b = m.bonus;
    const pct = Math.min(100, Math.round((s.available / b.stars) * 100));
    const city = Math.min(CITIES.length, Math.floor(s.total / 60));
    const route = CITIES.map((c, i) => `<div class="pt-city ${i < city ? "on" : ""} ${i === city ? "next" : ""}"><i>${i < city ? "★" : i + 1}</i><span>${c}</span></div>`).join("");
    const g = m.group;
    const a = m.att;
    const red = (m.redemptions || []).map((r) => `<div class="pt-row"><span>${money(r.amount)} so'm</span><span class="pt-badge ${r.status}">${esc(p("st_" + r.status))}</span></div>`).join("");
    return `
      <div class="pt-stats">${statBox("⭐ " + s.available, p("avail"))}${statBox(s.today + "/" + s.cap, p("today"))}${statBox("🔥 " + (m.streak || 0), p("streak"))}</div>
      <div class="card pt-card"><h3>🥨 ${esc(p("bonus"))}</h3>
        <p class="pt-mut">${esc(p("bonus_t", { n: b.stars, m: money(b.amount) }))}</p>
        <div class="pt-bar"><i style="width:${pct}%"></i></div><div class="pt-bar-l"><span>${s.available} / ${b.stars} ⭐</span><span>${pct}%</span></div>
        <button class="btn btn-primary btn-block" data-p="redeem" ${s.available >= b.stars ? "" : "disabled"}>${esc(p("redeem"))}</button>
        ${red ? `<div class="pt-list">${red}</div>` : ""}</div>
      <div class="card pt-card"><h3>🇩🇪 ${esc(p("route"))}</h3><p class="pt-mut">${esc(p("route_t"))}</p><div class="pt-route">${route}</div></div>
      <div class="card pt-card"><h3>👥 ${esc(p("group"))}</h3>
        ${g ? `<div class="pt-row"><b>${esc(g.name)}</b></div>
          ${g.teacher ? `<div class="pt-row"><span class="pt-mut">${esc(p("teacher"))}</span><span>${esc(g.teacher)}</span></div>` : ""}
          ${g.schedule ? `<div class="pt-row"><span class="pt-mut">${esc(p("sched"))}</span><span>${esc(g.schedule)}</span></div>` : ""}`
        : `<p class="pt-mut">${esc(p("nogroup"))}</p>`}</div>
      <div class="card pt-card"><h3>📅 ${esc(p("att"))}</h3>
        <div class="pt-att"><div class="ok"><b>${a.present}</b><span>${esc(p("present"))}</span></div><div class="lt"><b>${a.late}</b><span>${esc(p("late"))}</span></div><div class="no"><b>${a.absent}</b><span>${esc(p("absent"))}</span></div></div>
        ${(a.recent || []).length ? `<div class="pt-dots">${a.recent.slice().reverse().map((r) => `<i class="${r.status}" title="${esc(r.day)}"></i>`).join("")}</div>` : ""}</div>
      <div class="card pt-card"><h3>👤 ${esc(p("prof"))}</h3>
        <form data-pform="profile"><div class="field"><label>${esc(p("name"))}</label><input name="name" value="${esc(m.name)}" maxlength="80" required /></div>
        <div class="field"><label>${esc(p("phone"))}</label><input name="phone" type="tel" value="${esc(m.phone || "")}" maxlength="30" required /></div>
        <button class="btn btn-ghost btn-block">${esc(p("save"))}</button></form>
        <button class="btn btn-outline btn-block" data-p="newcode" style="margin-top:8px">${esc(p("newcode"))}</button>
        <button class="pt-link" data-p="logout">${esc(p("logout"))}</button></div>`;
  }

  function tTest() {
    const m = St.me, q = St.quiz;
    if (!q) {
      return `<div class="card pt-card pt-center"><div class="pt-emoji">📝</div><h3>${esc(p("daily"))}</h3>
        <p class="pt-mut">${esc(p("daily_t", { lv: m.level }))}</p>
        <div class="pt-stats" style="grid-template-columns:1fr 1fr">${statBox("⭐ " + m.stars.available, p("avail"))}${statBox(m.stars.today + "/" + m.stars.cap, p("today"))}</div>
        <button class="btn btn-primary btn-block" data-p="quiz" ${St.busy ? "disabled" : ""}>${esc(p("go"))}</button></div>`;
    }
    if (q.end) {
      let msg = "";
      if (q.capped) msg = p("capped", { n: m.stars.cap });
      else if (!q.items.length) msg = p("empty");
      return `<div class="card pt-card pt-center"><div class="pt-emoji">${q.capped ? "🌙" : "🏁"}</div><h3>${esc(p("result"))}: ${q.ok} / ${q.done}</h3>
        ${msg ? `<p class="pt-mut">${esc(msg)}</p>` : ""}
        <button class="btn btn-primary btn-block" data-p="quizclose">${esc(p("finish"))}</button></div>`;
    }
    const it = q.items[q.i];
    const opts = it.options.map((o, i) => {
      let cls = "";
      if (q.res) cls = i === q.res.answer ? "good" : i === q.pick ? "bad" : "";
      return `<button class="pt-opt ${cls}" data-p="pick" data-v="${i}" ${q.res || St.busy ? "disabled" : ""}><i>${"ABCD"[i]}</i><span>${esc(o)}</span></button>`;
    }).join("");
    let fb = "";
    if (q.res) {
      fb = `<div class="pt-fb ${q.res.correct ? "good" : "bad"}"><b>${esc(q.res.correct ? p("ok") : p("no"))}</b>${q.res.correct ? "" : `<div>${esc(p("right_is"))}: ${esc(it.options[q.res.answer])}</div>`}${q.res.explain ? `<div class="pt-mut">${esc(q.res.explain)}</div>` : ""}</div>
        <button class="btn btn-primary btn-block" data-p="nextq">${esc(q.i + 1 >= q.items.length ? p("finish") : p("next"))}</button>`;
    }
    return `<div class="card pt-card"><div class="pt-qh"><span>${q.i + 1} / ${q.items.length}</span><span>⭐ ${m.stars.today}/${m.stars.cap}</span></div>
      <div class="pt-bar"><i style="width:${Math.round((q.i / q.items.length) * 100)}%"></i></div>
      <div class="pt-q">${esc(it.q)}</div><div class="pt-opts">${opts}</div>${fb}</div>`;
  }

  function tPay() {
    const ps = St.me.payments || [];
    if (!ps.length) return `<div class="card pt-card pt-center"><div class="pt-emoji">💳</div><p class="pt-mut">${esc(p("nopay"))}</p></div>`;
    return `<h3 class="pt-h">${esc(p("pay_t"))}</h3>` + ps.map((x) => {
      const net = Math.max(0, x.due - x.discount), left = Math.max(0, net - x.paid);
      return `<div class="card pt-card"><div class="pt-row"><b>${esc(monthName(x.month))}</b><span class="pt-badge ${x.status}">${esc(p(x.status))}</span></div>
        <div class="pt-row"><span class="pt-mut">${esc(p("due"))}</span><span>${money(x.due)}</span></div>
        ${x.discount ? `<div class="pt-row"><span class="pt-mut">${esc(p("disc"))}</span><span>−${money(x.discount)}</span></div>` : ""}
        <div class="pt-row"><span class="pt-mut">${esc(p("paidamt"))}</span><span>${money(x.paid)}</span></div>
        ${left ? `<div class="pt-row"><span class="pt-mut">${esc(p("left"))}</span><b>${money(left)} so'm</b></div>` : ""}</div>`;
    }).join("");
  }

  function planKey() { const d = new Date(); return LS_DONE + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function planDone() { try { return JSON.parse(lsGet(planKey()) || "[]"); } catch (e) { return []; } }
  function tLearn() {
    const done = planDone();
    const plan = (PLAN[L()] || PLAN.uz).map((x, i) => `<button class="pt-check ${done.includes(i) ? "on" : ""}" data-p="plan" data-v="${i}"><i>${done.includes(i) ? "✓" : ""}</i><span>${esc(x)}</span></button>`).join("");
    const mats = St.mats;
    let list = `<p class="pt-mut">${esc(p("loading"))}</p>`;
    if (mats) list = mats.length ? mats.map((x) => `<div class="pt-mat"><div><b>${esc(x.title)}</b>${x.note ? `<div class="pt-mut">${esc(x.note)}</div>` : ""}</div>${x.url ? `<button class="btn btn-ghost pt-sm" data-p="mat" data-v="${esc(x.url)}">${esc(p("open"))}</button>` : ""}</div>`).join("") : `<p class="pt-mut">${esc(p("nomats"))}</p>`;
    return `<div class="card pt-card"><h3>✅ ${esc(p("plan"))}</h3><div class="pt-checks">${plan}</div></div>
      <div class="card pt-card"><h3>📚 ${esc(p("mats"))}</h3>${list}</div>`;
  }

  function tTop() {
    const it = St.top;
    if (!St.me.verified) return `<div class="pt-note">⏳ ${esc(p("unver"))}</div>`;
    if (!it) return `<p class="pt-mut">${esc(p("loading"))}</p>`;
    if (!it.length) return `<div class="card pt-card pt-center"><div class="pt-emoji">🏆</div><p class="pt-mut">${esc(p("notop"))}</p></div>`;
    return `<h3 class="pt-h">🏆 ${esc(p("top_t"))}</h3><div class="card pt-card">${it.map((x, i) => `<div class="pt-rank ${x.me ? "me" : ""}"><i>${i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</i><span>${esc(x.name)}</span><b>${x.stars} ⭐</b></div>`).join("")}</div>`;
  }

  // ---------- Chizish va yuklash ----------
  function render() {
    const h = St.host;
    if (!h || !h.isConnected) return;
    let html;
    if (St.view === "code") html = codeScreen();
    else if (St.me) html = cabinet();
    else if (token() && St.view === "loading") html = `<div class="spinner"></div>`;
    else html = welcome();
    h.innerHTML = html;
  }

  async function loadMe() {
    if (!token()) { St.me = null; St.view = "welcome"; return render(); }
    St.view = "loading"; render();
    const r = await call("s_me", { p_token: token() });
    if (r && r.ok) { St.me = r; St.view = "cabinet"; }
    else if (r && r.error === "net" && St.me) { /* eski ma'lumot qoladi */ }
    else if (r && r.error === "net") { St.view = "welcome"; St.err = p("net"); }
    else { lsSet(LS_T, null); St.me = null; St.view = "welcome"; }
    render();
  }
  async function refreshMe() {
    const r = await call("s_me", { p_token: token() });
    if (r && r.ok) St.me = r;
  }

  async function onTab(tab) {
    St.tab = tab; render();
    if (tab === "learn" && !St.mats) {
      const r = await call("s_materials", { p_token: token() });
      St.mats = r && r.ok ? r.items : [];
      if (St.tab === "learn") render();
    }
    if (tab === "top") {
      const r = await call("s_leaderboard", { p_token: token() });
      St.top = r && r.ok ? r.items : [];
      if (St.tab === "top") render();
    }
  }

  async function startQuiz() {
    St.busy = true; render();
    const r = await call("s_questions", { p_token: token() });
    St.busy = false;
    if (!r || !r.ok) { toast(p("net")); return render(); }
    St.quiz = { items: r.items, capped: !!r.capped, i: 0, ok: 0, done: 0, res: null, pick: null, end: !r.items.length };
    render();
  }
  async function pick(i) {
    const q = St.quiz; if (!q || q.res || St.busy) return;
    St.busy = true; q.pick = i; render();
    const r = await call("s_answer", { p_token: token(), p_qid: q.items[q.i].id, p_choice: i });
    St.busy = false;
    if (!r || !r.ok) {
      if (r && r.error === "done") { q.res = null; return nextQ(); }
      q.pick = null; toast(p("net")); return render();
    }
    if (r.capped) { q.capped = true; q.end = true; St.me.stars.today = r.cap; return render(); }
    q.res = r; q.done++; if (r.correct) q.ok++;
    St.me.stars.today = r.today;
    if (r.correct) { St.me.stars.available++; St.me.stars.total++; }
    render();
  }
  function nextQ() {
    const q = St.quiz; if (!q) return;
    q.i++; q.res = null; q.pick = null;
    if (q.i >= q.items.length) q.end = true;
    render();
  }

  async function onClick(e) {
    const el = e.target.closest("[data-p]");
    if (!el || !St.host || !St.host.contains(el)) return;
    const a = el.dataset.p, v = el.dataset.v;
    if (a === "view") { St.view = v; St.err = ""; return render(); }
    if (a === "tab") return onTab(v);
    if (a === "quiz") return startQuiz();
    if (a === "pick") return pick(Number(v));
    if (a === "nextq") return nextQ();
    if (a === "quizclose") { St.quiz = null; await refreshMe(); St.top = null; return render(); }
    if (a === "plan") { const d = planDone(); const i = Number(v); const k = d.indexOf(i); k >= 0 ? d.splice(k, 1) : d.push(i); lsSet(planKey(), JSON.stringify(d)); return render(); }
    if (a === "mat") return window.NemixOpenLink ? window.NemixOpenLink(v) : window.open(v, "_blank");
    if (a === "copycode") { try { await navigator.clipboard.writeText(St.newCode); } catch (x) {} return toast(p("copied")); }
    if (a === "codedone") { St.newCode = null; St.view = "cabinet"; return loadMe(); }
    if (a === "redeem") {
      const r = await call("s_redeem", { p_token: token() });
      if (r && r.ok) { toast(p("redeemed")); await refreshMe(); return render(); }
      toast(r && r.error === "not_verified" ? p("need_ver") : r && r.error === "pending_exists" ? p("pending") : r && r.error === "not_enough" ? p("need_more") : p("net"));
      return;
    }
    if (a === "newcode") {
      const r = await call("s_new_code", { p_token: token() });
      if (r && r.ok) { St.newCode = r.code; St.view = "code"; return render(); }
      return toast(p("net"));
    }
    if (a === "logout") {
      if (!confirm(p("logout_q"))) return;
      await call("p_logout", { p_token: token() });
      lsSet(LS_T, null); St.me = null; St.quiz = null; St.mats = null; St.top = null; St.tab = "home"; St.view = "welcome"; return render();
    }
  }

  async function onSubmit(e) {
    const f = e.target.closest("[data-pform]");
    if (!f || !St.host || !St.host.contains(f)) return;
    e.preventDefault();
    if (St.busy) return;
    const kind = f.dataset.pform, fd = new FormData(f);
    St.err = "";
    if (kind === "register") {
      St.busy = true; render();
      const tg = tgInfo();
      const r = await call("s_register", { p_name: fd.get("name"), p_phone: fd.get("phone"), p_level: fd.get("level"), p_tg_id: tg.id || null, p_tg_username: tg.un || null });
      St.busy = false;
      if (r && r.ok) { lsSet(LS_T, r.token); St.newCode = r.code; St.view = "code"; St.me = null; return render(); }
      St.err = errText(r && r.error); return render();
    }
    if (kind === "restore") {
      St.busy = true; render();
      const r = await call("s_restore", { p_code: fd.get("code") });
      St.busy = false;
      if (r && r.ok) { lsSet(LS_T, r.token); return loadMe(); }
      St.err = r && r.error === "net" ? p("net") : p("badcode"); return render();
    }
    if (kind === "profile") {
      const r = await call("s_update_profile", { p_token: token(), p_name: fd.get("name"), p_phone: fd.get("phone") });
      if (r && r.ok) { await refreshMe(); toast("✓"); return render(); }
      toast(errText(r && r.error));
    }
  }

  let wired = false;
  window.Portal = {
    mount(host) {
      St.host = host;
      if (!wired) { document.addEventListener("click", onClick); document.addEventListener("submit", onSubmit); wired = true; }
      host.classList.add("pt-host");
      if (St.me) { render(); refreshMe().then(render); }
      else if (token()) loadMe();
      else render();
    }
  };
})();
