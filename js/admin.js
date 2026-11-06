// Nemix — Admin panel
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const tr = (v) => (v == null ? "" : typeof v === "string" ? v : v.uz || v.ru || v.de || "");
  const LG = [["uz", "UZ"], ["ru", "RU"], ["de", "DE"]];
  const ICONS = ["badge", "team", "online", "certificate", "globe", "money", "search", "plus", "calendar", "clock", "reviews", "pin", "phone", "telegram", "check"];
  const ICON_OPTS = ICONS.map((i) => [i, i]);

  // ---------- Bo'limlar sxemasi ----------
  const POS = { k: "position", l: "Tartib raqami (kichigi birinchi chiqadi)", t: "number" };
  const SCHEMA = {
    courses: {
      label: "Kurslar", single: "kurs",
      title: (d) => tr(d.title) + (d.level ? " · " + d.level : ""),
      sub: (d) => Number(d.price).toLocaleString("ru-RU") + " so'm" + (d.popular ? " · 🔥 Ommabop" : "") + (Number(d.old_price) > Number(d.price) ? " · chegirma" : ""),
      fields: [
        { k: "level", l: "Daraja belgisi (A1, A2, B1, B2, C1 yoki EXAM)", t: "text" },
        { k: "title", l: "Kurs nomi", t: "i18n" },
        { k: "short", l: "Qisqa tavsif (kartada ko'rinadi)", t: "i18n" },
        { k: "description", l: "Batafsil tavsif", t: "i18n-area" },
        { k: "outcomes", l: "Kursdan keyin nimalar qila oladi? (har bir qator — alohida punkt)", t: "i18n-area" },
        { k: "format", l: "Format", t: "select", o: [["both", "Online va oflayn"], ["offline", "Faqat oflayn"], ["online", "Faqat online"]] },
        { k: "months", l: "Davomiyligi (oy)", t: "number" },
        { k: "lessons_week", l: "Haftada nechta dars", t: "number" },
        { k: "lesson_minutes", l: "Bir dars davomiyligi (daqiqa)", t: "number" },
        { k: "price", l: "Standart guruh narxi (so'm)", t: "number" },
        { k: "price_int", l: "Intensiv guruh narxi (0 — ko'rsatilmaydi)", t: "number" },
        { k: "price_ind", l: "Individual standart narxi (0 — ko'rsatilmaydi)", t: "number" },
        { k: "price_ind_int", l: "Individual intensiv narxi (0 — ko'rsatilmaydi)", t: "number" },
        { k: "price_unit", l: "Narx nimaga?", t: "select", o: [["month", "Oyiga"], ["total", "Butun kurs uchun"]] },
        { k: "old_price", l: "Eski narx (chegirma bo'lsa; bo'lmasa 0). Chegirma foizi avtomatik hisoblanadi", t: "number" },
        { k: "discount_note", l: "Chegirma haqida izoh (ixtiyoriy)", t: "i18n" },
        { k: "schedule", l: "Dars jadvali", t: "i18n" },
        { k: "popular", l: "«Eng ommabop kurslar» bo'limida ko'rsatish", t: "bool" },
        POS
      ],
      defaults: { level: "A1", format: "both", months: 3, lessons_week: 3, lesson_minutes: 90, price: 0, price_int: 0, price_ind: 0, price_ind_int: 0, old_price: 0, price_unit: "month", popular: false }
    },
    news: {
      label: "Yangiliklar", single: "yangilik",
      title: (d) => tr(d.title), sub: (d) => d.date || "",
      fields: [
        { k: "title", l: "Sarlavha", t: "i18n" },
        { k: "text", l: "Matn", t: "i18n-area" },
        { k: "tag", l: "Belgi (masalan: Yangilik, Chegirma, E'lon)", t: "i18n" },
        { k: "date", l: "Sana", t: "date" },
        POS
      ],
      defaults: { date: new Date().toISOString().slice(0, 10) }
    },
    vacancies: {
      label: "Vakansiyalar", single: "vakansiya",
      title: (d) => tr(d.title), sub: (d) => (d.active === false ? "⏸ Yashirin" : "✅ Faol") + (tr(d.salary) ? " · " + tr(d.salary) : ""),
      fields: [
        { k: "title", l: "Lavozim nomi", t: "i18n" },
        { k: "description", l: "Tavsif", t: "i18n-area" },
        { k: "requirements", l: "Talablar (har bir qator — alohida punkt)", t: "i18n-area" },
        { k: "salary", l: "Maosh", t: "i18n" },
        { k: "type", l: "Ish turi", t: "select", o: [["full", "To'liq ish kuni"], ["part", "Yarim kun"], ["intern", "Amaliyot"], ["remote", "Masofaviy"]] },
        { k: "deadline", l: "Ariza qabul qilish muddati (ixtiyoriy)", t: "date" },
        { k: "active", l: "Faol (saytda ko'rinadi)", t: "bool" },
        POS
      ],
      defaults: { type: "full", active: true }
    },
    reviews: {
      label: "Fikrlar", single: "fikr",
      title: (d) => d.name + " · " + "★".repeat(Number(d.rating) || 5), sub: (d) => tr(d.text).slice(0, 90),
      fields: [
        { k: "name", l: "O'quvchi ismi", t: "text" },
        { k: "course", l: "Qaysi kursda o'qigan (ixtiyoriy)", t: "text" },
        { k: "rating", l: "Baho (1–5)", t: "number" },
        { k: "text", l: "Fikr matni", t: "textarea" },
        POS
      ],
      defaults: { rating: 5 }
    },
    faq: {
      label: "Savol-javoblar", single: "savol",
      title: (d) => tr(d.q), sub: (d) => (d.category === "consult" ? "Konsultatsiya sahifasida" : "Kurslar sahifasida"),
      fields: [
        { k: "category", l: "Qaysi sahifada ko'rinadi", t: "select", o: [["course", "Kurslar sahifasi"], ["consult", "Konsultatsiya sahifasi"]] },
        { k: "q", l: "Savol", t: "i18n" },
        { k: "a", l: "Javob", t: "i18n-area" },
        POS
      ],
      defaults: { category: "course" }
    },
    teachers: {
      label: "Ustozlar", single: "ustoz",
      title: (d) => d.name, sub: (d) => tr(d.role),
      fields: [
        { k: "photo", l: "Rasm (kvadrat yoki portret, yuz ko'rinadigan)", t: "image" },
        { k: "name", l: "Ism-familiya", t: "text" },
        { k: "role", l: "Lavozim (masalan: Asosiy ustoz, Support ustoz)", t: "i18n" },
        { k: "bio", l: "Qisqacha ma'lumot (tajriba, sertifikatlar)", t: "i18n-area" },
        POS
      ],
      defaults: {}
    },
    results: {
      label: "Natijalar", single: "natija",
      title: (d) => d.name + (d.year ? " · " + d.year : ""), sub: (d) => tr(d.result),
      fields: [
        { k: "photo", l: "Rasm (bitiruvchi roziligi bilan!)", t: "image" },
        { k: "name", l: "Ism", t: "text" },
        { k: "year", l: "Yil (ixtiyoriy)", t: "text" },
        { k: "result", l: "Natija (masalan: B1 imtihoni topshirdi)", t: "i18n" },
        { k: "text", l: "Qisqa hikoya yoki fikr", t: "i18n-area" },
        POS
      ],
      defaults: {}
    },
    features: {
      label: "Afzalliklar", single: "afzallik",
      title: (d) => tr(d.title), sub: (d) => tr(d.text),
      fields: [
        { k: "icon", l: "Ikonka", t: "select", o: ICON_OPTS },
        { k: "title", l: "Sarlavha", t: "i18n" },
        { k: "text", l: "Qisqa matn", t: "i18n" },
        POS
      ],
      defaults: { icon: "check" }
    },
    germany: {
      label: "Germaniya", single: "Germaniya kartasi",
      title: (d) => tr(d.title), sub: (d) => tr(d.text).slice(0, 90),
      fields: [
        { k: "icon", l: "Ikonka", t: "select", o: ICON_OPTS },
        { k: "title", l: "Sarlavha", t: "i18n" },
        { k: "text", l: "Matn", t: "i18n-area" },
        POS
      ],
      defaults: { icon: "check" }
    },
    steps: {
      label: "Yo'l xaritasi", single: "bosqich",
      title: (d) => tr(d.title), sub: (d) => tr(d.text),
      fields: [{ k: "title", l: "Bosqich nomi", t: "i18n" }, { k: "text", l: "Qisqa izoh", t: "i18n" }, POS],
      defaults: {}
    }
  };

  const SETTINGS_FIELDS = [
    { k: "name", l: "Markaz nomi", t: "text" },
    { k: "tagline", l: "Qisqa tavsif (logo yonida)", t: "i18n" },
    { k: "hero_title", l: "Bosh sahifa katta sarlavhasi", t: "i18n" },
    { k: "hero_text", l: "Bosh sahifa izohi", t: "i18n-area" },
    { k: "about", l: "Markaz haqida", t: "i18n-area" },
    { k: "germany_intro", l: "Germaniya sahifasi kirish matni (hamkorlik haqida)", t: "i18n-area" },
    { k: "consult_minutes", l: "Konsultatsiya davomiyligi (daqiqa)", t: "number" },
    { k: "phone", l: "Telefon raqami", t: "text" },
    { k: "phone2", l: "Ikkinchi telefon raqami", t: "text" },
    { k: "telegram", l: "Telegram username (@ belgisisiz yoki bilan)", t: "text" },
    { k: "channel", l: "Telegram kanal username (ixtiyoriy)", t: "text" },
    { k: "instagram", l: "Instagram username yoki havola (ixtiyoriy)", t: "text" },
    { k: "website", l: "Veb-sayt (ixtiyoriy)", t: "text" },
    { k: "address", l: "Manzil", t: "i18n" },
    { k: "landmark", l: "Mo'ljal (masalan: «... yonida»)", t: "i18n" },
    { k: "lat", l: "Joylashuv: kenglik (latitude), masalan 41.2995", t: "text" },
    { k: "lng", l: "Joylashuv: uzunlik (longitude), masalan 69.2401", t: "text" },
    { k: "map_url", l: "Google Maps havolasi (ixtiyoriy, bo'lsa shu ochiladi)", t: "text" },
    { k: "yandex_url", l: "Yandex Maps havolasi (ixtiyoriy, bo'lsa shu ochiladi)", t: "text" },
    { k: "app_link", l: "Mini app havolasi (bot yaratgach, masalan https://t.me/BOT_NOMI/app). «Ulashish» tugmasi shuni yuboradi", t: "text" },
    { k: "hours", l: "Ish vaqti", t: "i18n" },
    { k: "s1_num", l: "1-statistika: raqam/matn (masalan A1–C1)", t: "text" },
    { k: "s1_label", l: "1-statistika izohi", t: "i18n" },
    { k: "s2_num", l: "2-statistika: raqam/matn", t: "text" },
    { k: "s2_label", l: "2-statistika izohi", t: "i18n" },
    { k: "s3_num", l: "3-statistika: raqam/matn", t: "text" },
    { k: "s3_label", l: "3-statistika izohi", t: "i18n" }
  ];

  const NAV = [["inbox", "📥 Arizalar"], ["courses", "📚 Kurslar"], ["news", "📰 Yangiliklar"], ["vacancies", "💼 Vakansiyalar"], ["teachers", "👩‍🏫 Ustozlar"], ["results", "🏆 Natijalar"], ["reviews", "⭐ Fikrlar"], ["features", "✨ Afzalliklar"], ["germany", "🇩🇪 Konsultatsiya mavzulari"], ["faq", "❓ Savol-javoblar"], ["steps", "🧭 Yo'l xaritasi"], ["settings", "⚙️ Sozlamalar"], ["tools", "🛠 Vositalar"]];
  const NAV2 = () => (window.Admin2 ? window.Admin2.tabs : []);

  let DATA = null, SUBS = [], tab = "inbox", inboxFilter = "all", session = null;

  // ---------- Yordamchi ----------
  function toast(m) {
    const el = document.createElement("div");
    el.className = "toast"; el.style.bottom = "24px"; el.textContent = m;
    document.body.appendChild(el); setTimeout(() => el.remove(), 2600);
  }
  async function guard(fn) {
    try { return await fn(); } catch (e) { console.error(e); toast("Xatolik: " + (e.message || e)); }
  }
  const dt = (iso) => { const d = new Date(iso); return isNaN(d) ? "" : d.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" }); };

  // ---------- Kirish ----------
  function renderLogin(msg) {
    $("#root").innerHTML = `<div class="login-wrap"><form class="card login form" id="lf">
      <img class="logo" src="images/logo.png" alt="" /><h1>Admin panel</h1><p class="sub">Nemix nemis tili markazi</p>
      <div class="field"><label>Login (email)</label><input name="email" autocomplete="username" required /></div>
      <div class="field"><label>Parol</label><input name="password" type="password" autocomplete="current-password" required /></div>
      <div class="err">${esc(msg || "")}</div>
      <button class="btn btn-primary btn-block" type="submit">Kirish</button>
      ${DB.mode === "demo" ? `<p class="note">Demo rejim. Login: <b>${esc(window.NEMIX_CONFIG.DEMO_ADMIN.email)}</b>, parol: <b>${esc(window.NEMIX_CONFIG.DEMO_ADMIN.password)}</b></p>` : ""}
    </form></div>`;
    $("#lf").onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      try { await DB.login(String(f.get("email")).trim(), String(f.get("password"))); await boot(); }
      catch (err) { renderLogin(err.message); }
    };
  }

  // ---------- Asosiy ekran ----------
  async function refresh() {
    DATA = await DB.loadAll();
    SUBS = await DB.submissions();
  }
  function newCount() { return SUBS.filter((s) => s.status === "new").length; }

  function renderShell() {
    const n = newCount();
    $("#root").innerHTML = `<div class="admin">
      <div class="a-head"><img src="images/logo.png" alt="" /><div class="grow"><b>Nemix Admin</b><small>${esc(session.email)}</small></div>
        <a class="btn btn-ghost btn-sm" href="index.html" target="_blank">Saytni ko'rish</a>
        <button class="btn btn-ghost btn-sm" id="logout">Chiqish</button></div>
      <div class="a-nav">${NAV2().concat(NAV).map(([id, l]) => `<button class="chip ${tab === id ? "on" : ""}" data-tab="${id}">${l}${id === "inbox" && n ? `<span class="count">${n}</span>` : ""}</button>`).join("")}</div>
      <div id="content"></div></div>`;
    $("#logout").onclick = async () => { await DB.logout(); session = null; renderLogin(); };
    document.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => { tab = b.dataset.tab; renderShell(); }));
    renderContent();
  }

  function renderContent() {
    const c = $("#content");
    if (window.Admin2 && window.Admin2.has(tab)) return window.Admin2.render(tab, c, { showSheet, closeSheet, toast, guard, setTab: (t) => { tab = t; renderShell(); } });
    if (tab === "inbox") return renderInbox(c);
    if (tab === "settings") return renderSettings(c);
    if (tab === "tools") return renderTools(c);
    renderList(c, tab);
  }

  // ---------- Arizalar ----------
  const KIND = { consult: ["🗓 Konsultatsiya", "badge"], apply: ["💼 Vakansiyaga ariza", "badge off"], review: ["⭐ Yangi fikr", "badge"] };
  function renderInbox(c) {
    const list = SUBS.filter((s) => inboxFilter === "all" || s.kind === inboxFilter || (inboxFilter === "new" && s.status === "new"));
    c.innerHTML = `<div class="a-top"><h1>Arizalar</h1></div>
      <div class="chips" style="margin:0 0 12px">${[["all", "Hammasi"], ["new", "Yangi"], ["consult", "Konsultatsiya"], ["apply", "Vakansiya"], ["review", "Fikrlar"]].map(([id, l]) => `<button class="chip ${inboxFilter === id ? "on" : ""}" data-f="${id}">${l}</button>`).join("")}</div>
      <div class="a-list">${list.length ? list.map(subCard).join("") : '<div class="card empty">Hozircha arizalar yo\'q.</div>'}</div>`;
    c.querySelectorAll("[data-f]").forEach((b) => (b.onclick = () => { inboxFilter = b.dataset.f; renderContent(); }));
    c.querySelectorAll("[data-done]").forEach((b) => (b.onclick = () => guard(async () => { const s = SUBS.find((x) => x.id === b.dataset.done); await DB.updateSubmission(s.id, { status: s.status === "new" ? "done" : "new" }); await refresh(); renderShell(); })));
    c.querySelectorAll("[data-del]").forEach((b) => (b.onclick = () => guard(async () => { if (!confirm("Bu arizani o'chirasizmi?")) return; await DB.removeSubmission(b.dataset.del); await refresh(); renderShell(); })));
    c.querySelectorAll("[data-pub]").forEach((b) => (b.onclick = () => guard(async () => {
      const s = SUBS.find((x) => x.id === b.dataset.pub); const d = s.data;
      await DB.save("reviews", { name: d.name, course: d.course || "", rating: d.rating || 5, text: d.text, position: (DATA.reviews.length || 0) + 1 });
      await DB.updateSubmission(s.id, { status: "done" }); await refresh(); toast("Fikr saytga chiqarildi ✅"); renderShell();
    })));
  }
  function subCard(s) {
    const d = s.data || {}; const [kl, kc] = KIND[s.kind] || [s.kind, "badge"];
    const rows = [];
    const add = (k, v) => v && rows.push(`<span>${k}</span><div>${v}</div>`);
    add("Ism", esc(d.name));
    if (d.phone) add("Telefon", `<a href="tel:${esc(String(d.phone).replace(/[^\d+]/g, ""))}">${esc(d.phone)}</a>`);
    if (d.tg) add("Telegram", `<a href="https://t.me/${esc(String(d.tg).replace(/^@/, ""))}" target="_blank">${esc(d.tg)}</a>`);
    if (d.tg_user && d.tg_user.username) add("TG akkaunt", `<a href="https://t.me/${esc(d.tg_user.username)}" target="_blank">@${esc(d.tg_user.username)}</a>`);
    add("Kurs", esc(d.course)); add("Vakansiya", esc(d.vacancy)); add("Qulay vaqt", esc(d.time));
    add("Savol", esc(d.comment)); add("Tajriba", esc(d.experience));
    if (d.cv) add("CV", `<a href="${esc(d.cv)}" target="_blank" rel="noopener">${esc(d.cv)}</a>`);
    if (s.kind === "review") { add("Baho", "★".repeat(Number(d.rating) || 5)); add("Fikr", esc(d.text)); }
    add("Til", esc((d.lang || "").toUpperCase()));
    return `<div class="card sub-card ${s.status === "done" ? "done" : ""}">
      <div class="sub-top"><span class="${kc}">${kl}</span><small style="color:var(--muted)">${esc(dt(s.created_at))} ${s.status === "new" ? "· 🆕" : "· ✅"}</small></div>
      <div class="kv">${rows.join("")}</div>
      <div class="sub-acts">
        ${s.kind === "review" && s.status === "new" ? `<button class="btn btn-primary btn-sm" data-pub="${s.id}">Saytga chiqarish</button>` : ""}
        <button class="btn btn-ghost btn-sm" data-done="${s.id}">${s.status === "new" ? "✅ Bajarildi" : "↩ Yangi qilish"}</button>
        <button class="btn btn-danger btn-sm" data-del="${s.id}">🗑</button></div></div>`;
  }

  // ---------- Ro'yxat (CRUD) ----------
  function renderList(c, col) {
    const sc = SCHEMA[col]; const items = DATA[col] || [];
    c.innerHTML = `<div class="a-top"><h1>${sc.label}</h1><button class="btn btn-primary btn-sm" id="add">+ Qo'shish</button></div>
      <div class="a-list">${items.length ? items.map((it) => `<div class="card row"><div class="pos">${esc(it.position)}</div>
        <div class="grow"><b>${esc(sc.title(it))}</b><small>${esc(sc.sub(it))}</small></div>
        <div class="acts"><button class="btn btn-ghost btn-sm" data-edit="${it.id}">✏️</button><button class="btn btn-danger btn-sm" data-rm="${it.id}">🗑</button></div></div>`).join("") : `<div class="card empty">Bu bo'limda hali hech narsa yo'q. «+ Qo'shish» ni bosing.</div>`}</div>`;
    $("#add").onclick = () => openForm(col, { ...sc.defaults, position: items.length + 1 });
    c.querySelectorAll("[data-edit]").forEach((b) => (b.onclick = () => openForm(col, items.find((x) => x.id === b.dataset.edit))));
    c.querySelectorAll("[data-rm]").forEach((b) => (b.onclick = () => guard(async () => { if (!confirm("O'chirishni tasdiqlaysizmi?")) return; await DB.remove(b.dataset.rm); await refresh(); renderShell(); toast("O'chirildi"); })));
  }

  // ---------- Forma yaratish ----------
  function fieldHtml(f, item) {
    const v = item[f.k];
    const label = `<label>${esc(f.l)}</label>`;
    if (f.t === "image") return `<div class="field">${label}<div class="img-up"><div class="img-prev">${v ? `<img src="${esc(v)}" alt="">` : "📷"}</div><div class="img-act"><input type="file" accept="image/*" data-img="${f.k}" /><button type="button" class="btn btn-ghost btn-sm" data-imgdel="${f.k}">Rasmni olib tashlash</button><small data-imgst></small></div><input type="hidden" name="${f.k}" value="${esc(v || "")}" /></div></div>`;
    if (f.t === "i18n" || f.t === "i18n-area") {
      const obj = typeof v === "object" && v ? v : { uz: v || "" };
      return `<div class="field">${label}<div class="i18n-box">${LG.map(([l, n]) => `<div class="lg"><em>${n}</em>${f.t === "i18n" ? `<input name="${f.k}__${l}" value="${esc(obj[l] || "")}" />` : `<textarea name="${f.k}__${l}">${esc(obj[l] || "")}</textarea>`}</div>`).join("")}</div></div>`;
    }
    if (f.t === "textarea") return `<div class="field">${label}<textarea name="${f.k}">${esc(tr(v))}</textarea></div>`;
    if (f.t === "select") return `<div class="field">${label}<select name="${f.k}">${f.o.map(([val, l]) => `<option value="${esc(val)}" ${String(v) === String(val) ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></div>`;
    if (f.t === "bool") return `<div class="field check"><input type="checkbox" name="${f.k}" id="f_${f.k}" ${v ? "checked" : ""} /><label for="f_${f.k}">${esc(f.l)}</label></div>`;
    if (f.t === "number") return `<div class="field">${label}<input name="${f.k}" type="number" step="any" value="${esc(v ?? "")}" /></div>`;
    if (f.t === "date") return `<div class="field">${label}<input name="${f.k}" type="date" value="${esc(v || "")}" /></div>`;
    return `<div class="field">${label}<input name="${f.k}" value="${esc(tr(v))}" /></div>`;
  }
  function readForm(form, fields, base) {
    const out = { ...base };
    fields.forEach((f) => {
      if (f.t === "i18n" || f.t === "i18n-area") out[f.k] = Object.fromEntries(LG.map(([l]) => [l, form.elements[f.k + "__" + l].value.trim()]));
      else if (f.t === "bool") out[f.k] = form.elements[f.k].checked;
      else if (f.t === "number") out[f.k] = form.elements[f.k].value === "" ? 0 : Number(form.elements[f.k].value);
      else out[f.k] = form.elements[f.k].value.trim();
    });
    return out;
  }
  function openForm(col, item) {
    const sc = SCHEMA[col];
    showSheet(`<h2>${item.id ? "Tahrirlash" : "Yangi " + sc.single}</h2><p class="sub">Uch tildagi maydonlarni to'ldiring (UZ / RU / DE). Bo'sh qolsa o'zbekcha ko'rsatiladi.</p>
      <form class="form form-grid" id="ef">${sc.fields.map((f) => fieldHtml(f, item)).join("")}
      <div class="err" id="ferr"></div>
      <div style="display:flex;gap:10px"><button type="button" class="btn btn-ghost" data-x style="flex:1">Bekor qilish</button><button class="btn btn-primary" type="submit" style="flex:2">Saqlash</button></div></form>`);
    document.querySelectorAll("#ef [data-img]").forEach((inp) => (inp.onchange = async () => {
      const file = inp.files[0]; if (!file) return;
      const box = inp.closest(".img-up"), st = box.querySelector("[data-imgst]");
      st.textContent = "Yuklanmoqda…";
      try {
        const url = await DB.uploadImage(file);
        $("#ef").elements[inp.dataset.img].value = url;
        box.querySelector(".img-prev").innerHTML = `<img src="${url}" alt="">`;
        st.textContent = "Tayyor ✅ Endi «Saqlash» ni bosing";
      } catch (e) { st.textContent = "Xatolik: " + (e.message || e); }
    }));
    document.querySelectorAll("#ef [data-imgdel]").forEach((b) => (b.onclick = () => {
      $("#ef").elements[b.dataset.imgdel].value = "";
      b.closest(".img-up").querySelector(".img-prev").textContent = "📷";
    }));
    $("#ef").onsubmit = (e) => { e.preventDefault(); guard(async () => {
      const data = readForm(e.target, sc.fields, { id: item.id });
      if (!Object.values(data).some((x) => (typeof x === "object" && x ? Object.values(x).some(Boolean) : x))) return;
      await DB.save(col, data); closeSheet(); await refresh(); renderShell(); toast("Saqlandi ✅");
    }); };
  }

  // ---------- Sozlamalar ----------
  function renderSettings(c) {
    const item = { ...window.NEMIX_SEED.settings[0], ...DATA.settings };
    c.innerHTML = `<div class="a-top"><h1>Sozlamalar</h1></div>
      <form class="card form form-grid" id="sf" style="padding:18px">${SETTINGS_FIELDS.map((f) => fieldHtml(f, item)).join("")}
      <button class="btn btn-primary" type="submit">Saqlash</button></form>`;
    $("#sf").onsubmit = (e) => { e.preventDefault(); guard(async () => {
      const data = readForm(e.target, SETTINGS_FIELDS, { id: DATA.settings.id, position: 1 });
      await DB.save("settings", data); await refresh(); toast("Saqlandi ✅"); renderShell();
    }); };
  }

  // ---------- Vositalar ----------
  function renderTools(c) {
    c.innerHTML = `<div class="a-top"><h1>Vositalar</h1></div><div class="tools">
      <div class="card tool"><h3>Ish rejimi</h3><p>${DB.mode === "demo"
        ? '<span class="mode demo">DEMO</span> Ma\'lumotlar faqat shu brauzerda saqlanadi. Haqiqiy ishlash uchun Supabase\'ni ulang (README.md dagi yo\'riqnoma).'
        : '<span class="mode live">SUPABASE ULANGAN</span> Ma\'lumotlar bulutda saqlanadi, barcha qurilmalarda bir xil ko\'rinadi.'}</p></div>
      <div class="card tool"><h3>Namuna ma\'lumotlarni yuklash</h3><p>Baza bo'sh bo'lsa, boshlang'ich kurslar, Germaniya bo'limi va boshqa namunalarni joylaydi. Keyin ularni tahrirlaysiz.</p>
        <button class="btn btn-primary btn-sm" id="seed" style="justify-self:start">Namunalarni yuklash</button></div>
      <div class="card tool"><h3>Zaxira nusxa (JSON)</h3><p>Barcha kontent va arizalarni faylga yuklab oling.</p>
        <button class="btn btn-ghost btn-sm" id="exp" style="justify-self:start">Yuklab olish</button></div>
      ${DB.mode === "demo" ? `<div class="card tool"><h3>Demo ma'lumotlarni tiklash</h3><p>Hammasini boshlang'ich holatga qaytaradi.</p><button class="btn btn-danger btn-sm" id="rst" style="justify-self:start">Tiklash</button></div>` : ""}</div>`;
    $("#seed").onclick = () => guard(async () => { const ok = await DB.seedIfEmpty(); await refresh(); toast(ok ? "Namunalar yuklandi ✅" : "Baza bo'sh emas — yuklanmadi"); renderShell(); });
    $("#exp").onclick = () => { const blob = new Blob([JSON.stringify({ content: DATA, submissions: SUBS }, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "nemix-backup-" + new Date().toISOString().slice(0, 10) + ".json"; a.click(); };
    const r = $("#rst"); if (r) r.onclick = () => guard(async () => { if (!confirm("Hamma demo ma'lumotlar o'chib, boshlang'ich holat tiklanadi. Davom etasizmi?")) return; DB.resetDemo(); await refresh(); renderShell(); toast("Tiklandi"); });
  }

  // ---------- Sheet ----------
  function showSheet(html) {
    $("#overlay-root").innerHTML = `<div class="overlay" id="ov"><div class="sheet wide"><div class="grab"></div>${html}</div></div>`;
    document.body.style.overflow = "hidden";
    $("#ov").onclick = (e) => { if (e.target.id === "ov") closeSheet(); };
    document.querySelectorAll("[data-x]").forEach((b) => (b.onclick = closeSheet));
  }
  function closeSheet() { $("#overlay-root").innerHTML = ""; document.body.style.overflow = ""; }

  // ---------- Boshlash ----------
  async function boot() {
    session = await DB.session();
    if (!session) return renderLogin();
    $("#root").innerHTML = '<div class="spinner"></div>';
    try { await refresh(); } catch (e) { console.error(e); $("#root").innerHTML = `<div class="login-wrap"><div class="card login"><p class="err">Ma'lumotlarni yuklab bo'lmadi: ${esc(e.message || e)}</p><button class="btn btn-primary btn-block" onclick="location.reload()">Qayta urinish</button></div></div>`; return; }
    const empty = !Object.keys(DATA.settings).length && !DATA.courses.length;
    if (empty) tab = "tools";
    renderShell();
  }

  try { const m = localStorage.getItem("nemix_theme"); if (m) document.documentElement.dataset.theme = m; } catch (e) {}
  boot();
})();
