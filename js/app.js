// Nemix mini app — mijoz qismi
(function () {
  const t = (k, v) => I18N.t(k, v);
  const tr = (v) => I18N.tr(v);
  const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  const $ = (s, r = document) => r.querySelector(s);

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ico = (n) => `<img src="images/${n}.png" alt="" loading="lazy" />`;

  const SVG = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/><path d="M9 7h6"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/></svg>',
    news: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9h10M7 13h10M7 17h6"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>'
  };

  const TABS = [
    ["home", "tab_home", "home"],
    ["courses", "tab_courses", "book"],
    ["consult", "tab_consult", "flag"],
    ["news", "tab_news", "news"],
    ["contact", "tab_contact", "chat"],
    ["me", "tab_me", "user"]
  ];

  let S = null;            // yuklangan ma'lumotlar
  let route = "home";
  let newsTab = "news";
  let courseFilter = "all";
  let sheetOpen = false;

  // ---------- Telegram yordamchilari ----------
  const tgUser = () => (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) || null;
  const haptic = (type) => { try { tg && tg.HapticFeedback && tg.HapticFeedback.notificationOccurred(type); } catch (e) {} };
  const hapticTap = () => { try { tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred("light"); } catch (e) {} };

  function openLink(url) {
    if (!url) return;
    try {
      if (tg && /^https:\/\/t\.me\//i.test(url) && tg.openTelegramLink) return tg.openTelegramLink(url);
      if (tg && /^https?:\/\//i.test(url) && tg.openLink) return tg.openLink(url);
    } catch (e) {}
    window.open(url, "_blank", "noopener");
  }

  window.NemixOpenLink = openLink;

  const tgHandle = (v) => String(v || "").trim().replace(/^https?:\/\/t\.me\//i, "").replace(/^@/, "");
  const igUrl = (v) => (/^https?:\/\//i.test(v) ? v : "https://instagram.com/" + String(v).replace(/^@/, ""));
  const webUrl = (v) => (/^https?:\/\//i.test(v) ? v : "https://" + v);

  // ---------- Mavzu va til ----------
  function applyTheme(mode) {
    document.documentElement.dataset.theme = mode;
    try { localStorage.setItem("nemix_theme", mode); } catch (e) {}
    const bg = mode === "dark" ? "#0b0a09" : "#fbf8f4";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", bg);
    try { tg && tg.setHeaderColor && tg.setHeaderColor(bg); tg && tg.setBackgroundColor && tg.setBackgroundColor(bg); } catch (e) {}
  }
  function initTheme() {
    let m = null;
    try { m = localStorage.getItem("nemix_theme"); } catch (e) {}
    if (!m) m = (tg && tg.colorScheme) || (window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    applyTheme(m === "light" ? "light" : "dark");
  }
  function initLang() {
    let l = null;
    try { l = localStorage.getItem("nemix_lang"); } catch (e) {}
    if (!l) {
      const code = ((tgUser() && tgUser().language_code) || navigator.language || "uz").slice(0, 2).toLowerCase();
      l = ["uz", "ru", "de"].includes(code) ? code : "uz";
    }
    I18N.set(l);
  }
  function setLang(l) {
    I18N.set(l);
    try { localStorage.setItem("nemix_lang", l); } catch (e) {}
    renderChrome();
    renderView();
  }

  // ---------- Chrome (header + tabbar) ----------
  function renderChrome() {
    const s = (S && S.settings) || {};
    const dark = document.documentElement.dataset.theme === "dark";
    $("#header").innerHTML = `
      <div class="brand"><img src="images/logo.png" alt="Nemix" />
        <div><b>${esc(s.name || "Nemix")}</b><small>${esc(tr(s.tagline))}</small></div></div>
      <div class="langs">${I18N.LANGS.map((l) => `<button data-lang="${l}" class="${l === I18N.lang ? "on" : ""}">${l.toUpperCase()}</button>`).join("")}</div>
      <button class="icon-btn" data-action="theme" aria-label="${esc(t("theme"))}">${dark ? SVG.sun : SVG.moon}</button>`;
    $("#tabbar").innerHTML = TABS.map(([id, key, icon]) => `<button class="tab ${route === id ? "on" : ""}" data-nav="${id}">${SVG[icon]}<span>${esc(t(key))}</span></button>`).join("");
    $("#banner").innerHTML = DB.mode === "demo" ? `<div class="demo-banner">${esc(t("demo_banner"))}</div>` : "";
  }

  // ---------- Yordamchi hisoblar ----------
  const discountPct = (c) => (Number(c.old_price) > Number(c.price) && Number(c.price) > 0 ? Math.round((1 - Number(c.price) / Number(c.old_price)) * 100) : 0);
  const fmtLabel = (f) => t(f === "online" ? "fmt_online" : f === "offline" ? "fmt_offline" : "fmt_both");
  const unitLabel = (c) => (c.price_unit === "total" ? t("total") : t("per_month"));
  const stars = (n) => { n = Math.max(1, Math.min(5, Number(n) || 5)); return "★".repeat(n) + `<span class="dim">${"★".repeat(5 - n)}</span>`; };
  const consultMin = () => (S && S.settings && S.settings.consult_minutes) || 15;

  // ---------- Kurs kartasi ----------
  function courseCard(c, wide) {
    const d = discountPct(c);
    return `<button class="card course-card ${wide ? "wide" : ""}" data-course="${c.id}">
      <div class="course-top"><span class="lvl">${esc(c.level)}</span>
        <span style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">
          ${c.popular ? `<span class="badge">🔥 ${esc(t("popular_badge"))}</span>` : ""}${d ? `<span class="badge off">-${d}%</span>` : ""}
        </span></div>
      <h3>${esc(tr(c.title))}</h3>
      <p>${esc(tr(c.short))}</p>
      <div class="meta"><span>${esc(fmtLabel(c.format))}</span><span>${esc(c.months)} ${esc(t("months"))}</span><span>${esc(c.lessons_week)} ${esc(t("lessons_week"))}</span></div>
      <div class="price-row"><span class="price">${c.price_int ? `<small>${esc(t("from"))}</small> ` : ""}${esc(I18N.price(c.price))} <small>/ ${esc(unitLabel(c))}</small></span>${d ? `<span class="old">${esc(I18N.price(c.old_price))}</span>` : ""}</div>
    </button>`;
  }

  // ---------- Sahifalar ----------
  // ---------- Xarita, ish vaqti, FAQ ----------
  const num = (v) => { const n = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(n) ? n : null; };

  function mapLinks() {
    const s = S.settings, lat = num(s.lat), lng = num(s.lng);
    const addrUz = (s.address && (s.address.uz || tr(s.address))) || "";
    const addr = encodeURIComponent(addrUz + ", Uzbekistan");
    const hasC = lat !== null && lng !== null;
    return {
      hasC,
      google: s.map_url || (hasC ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : `https://www.google.com/maps/search/?api=1&query=${addr}`),
      yandex: s.yandex_url || (hasC ? `https://yandex.com/maps/?pt=${lng},${lat}&z=17&l=map` : `https://yandex.com/maps/?text=${addr}`),
      route: hasC ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` : `https://www.google.com/maps/dir/?api=1&destination=${addr}`,
      embed: hasC ? `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed` : ""
    };
  }

  function openStatus() {
    const m = /(\d{1,2}):(\d{2})\s*[–—-]\s*(\d{1,2}):(\d{2})/.exec(tr(S.settings.hours) || "");
    if (!m) return null;
    const open = +m[1] * 60 + +m[2], close = +m[3] * 60 + +m[4];
    let now;
    try {
      const p = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      now = (+p.find((x) => x.type === "hour").value % 24) * 60 + +p.find((x) => x.type === "minute").value;
    } catch (e) { const d = new Date(); now = d.getHours() * 60 + d.getMinutes(); }
    const pad = (n) => String(Math.floor(n / 60)).padStart(2, "0") + ":" + String(n % 60).padStart(2, "0");
    const isOpen = now >= open && now < close;
    return { isOpen, text: isOpen ? t("open_now", { t: pad(close) }) : t("closed_now", { t: pad(open) }) };
  }
  const statusPill = () => { const o = openStatus(); return o ? `<span class="status ${o.isOpen ? "on" : "off"}"><i></i>${esc(o.text)}</span>` : ""; };

  function locationCard(full) {
    const s = S.settings;
    if (!tr(s.address)) return "";
    const m = mapLinks();
    return `<div class="card loc">
      ${full && m.embed ? `<iframe class="map" src="${esc(m.embed)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="map"></iframe>` : ""}
      <div class="loc-body">
        <div class="loc-row">${ico("pin")}<div><b>${esc(tr(s.address))}</b>
          ${tr(s.landmark) ? `<small>📍 ${esc(tr(s.landmark))}</small>` : ""}${tr(s.hours) ? `<small>🕘 ${esc(tr(s.hours))}</small>` : ""}</div></div>
        ${statusPill()}
        <div class="loc-actions">
          <button class="btn btn-primary" data-link="${esc(m.google)}">Google Maps</button>
          <button class="btn btn-ghost" data-link="${esc(m.yandex)}">Yandex Maps</button>
          <button class="btn btn-ghost" data-link="${esc(m.route)}">🧭 ${esc(t("route"))}</button>
          <button class="btn btn-ghost" data-copy="${esc(tr(s.address))}">📋 ${esc(t("copy_address"))}</button>
        </div>
      </div></div>`;
  }

  const avatarImg = (url, name, cls) => url
    ? `<img class="${cls}" src="${esc(url)}" alt="" loading="lazy" />`
    : `<div class="${cls} ph">${esc(String(name || "?").trim().charAt(0).toUpperCase())}</div>`;

  function teachersHtml() {
    if (!(S.teachers || []).length) return "";
    return `<section class="section"><div class="section-head"><div><h2>${esc(t("teachers_title"))}</h2><p>${esc(t("teachers_sub"))}</p></div></div>
      <div class="carousel">${S.teachers.map((x) => `<button class="card teacher" data-teacher="${x.id}">${avatarImg(x.photo, x.name, "t-photo")}<b>${esc(x.name)}</b><span>${esc(tr(x.role))}</span></button>`).join("")}</div></section>`;
  }
  function resultsHtml() {
    if (!(S.results || []).length) return "";
    return `<section class="section"><div class="section-head"><div><h2>🏆 ${esc(t("results_title"))}</h2><p>${esc(t("results_sub"))}</p></div></div>
      <div class="carousel">${S.results.map((x) => `<button class="card result" data-result="${x.id}">${avatarImg(x.photo, x.name, "r-photo")}<div class="r-body">${tr(x.result) ? `<span class="badge">${esc(tr(x.result))}</span>` : ""}<b>${esc(x.name)}${x.year ? ` · ${esc(x.year)}` : ""}</b><p>${esc(tr(x.text))}</p></div></button>`).join("")}</div></section>`;
  }

  function faqHtml(cat) {
    const list = (S.faq || []).filter((f) => f.category === cat);
    if (!list.length) return "";
    return `<section class="section"><div class="section-head"><div><h2>${esc(t("faq_title"))}</h2></div></div>
      <div class="faq">${list.map((f) => `<details class="card faq-i"><summary>${esc(tr(f.q))}</summary><p>${esc(tr(f.a))}</p></details>`).join("")}</div></section>`;
  }

  // ---------- Sahifalar ----------
  function viewHome() {
    const s = S.settings;
    const popular = S.courses.filter((c) => c.popular);
    const title = esc(tr(s.hero_title)).replace(/Nemix/g, "<em>Nemix</em>");
    const stats = [1, 2, 3].map((i) => (s["s" + i + "_num"] ? `<div class="stat"><b>${esc(s["s" + i + "_num"])}</b><span>${esc(tr(s["s" + i + "_label"]))}</span></div>` : "")).join("");
    return `
    <section class="hero">
      <span class="pill"><i></i>${esc(t("consult_badge", { n: consultMin() }))}</span>
      <h1>${title}</h1>
      <p>${esc(tr(s.hero_text))}</p>
      <div class="hero-actions">
        <button class="btn btn-primary" data-action="consult">${esc(t("btn_consult"))}</button>
        <button class="btn btn-dark" data-nav="courses">${esc(t("btn_courses"))}</button>
      </div>
      <div class="hero-art"><span class="chip-float a">A1 → C1</span><span class="chip-float b">🇩🇪 Deutschland</span>${ico("teacher")}</div>
    </section>
    <div class="stats">${stats}</div>

    <section class="section">
      <div class="section-head"><div><h2>${esc(t("path_title"))}</h2><p>${esc(t("path_sub"))}</p></div></div>
      <div class="paths">
        <button class="card path" data-nav="courses">${ico("badge")}<b>${esc(t("path_course_t"))}</b><span>${esc(t("path_course_s"))}</span><em>${esc(t("btn_courses"))} →</em></button>
        <button class="card path" data-nav="consult">${ico("globe")}<b>${esc(t("path_consult_t"))}</b><span>${esc(t("path_consult_s", { n: consultMin() }))}</span><em>${esc(t("details"))} →</em></button>
      </div>
    </section>

    ${popular.length ? `<section class="section">
      <div class="section-head"><div><h2>🔥 ${esc(t("popular_title"))}</h2></div><button class="link" data-nav="courses">${esc(t("btn_all_courses"))} →</button></div>
      <div class="carousel">${popular.map((c) => courseCard(c)).join("")}</div>
    </section>` : ""}

    ${teachersHtml()}

    <section class="section">
      <div class="section-head"><div><h2>${esc(t("about_title"))}</h2></div></div>
      <div class="card about">${esc(tr(s.about))}</div>
    </section>

    ${S.features.length ? `<section class="section">
      <div class="section-head"><div><h2>${esc(t("why_title"))}</h2></div></div>
      <div class="features">${S.features.map((f) => `<div class="card feature">${ico(f.icon || "check")}<b>${esc(tr(f.title))}</b><span>${esc(tr(f.text))}</span></div>`).join("")}</div>
    </section>` : ""}

    <section class="section">
      <div class="cta">
        <h2>${esc(t("cta_title"))}</h2>
        <p>${esc(t("cta_text", { n: consultMin() }))}</p>
        <button class="btn btn-dark" data-action="consult">${esc(t("btn_consult"))}</button>
      </div>
    </section>

    ${tr(s.address) ? `<section class="section"><div class="section-head"><div><h2>${esc(t("location"))}</h2></div><button class="link" data-nav="contact">${esc(t("tab_contact"))} →</button></div>${locationCard(false)}</section>` : ""}

    ${resultsHtml()}

    <section class="section">
      <div class="section-head"><div><h2>${esc(t("reviews_title"))}</h2><p>${esc(t("reviews_sub"))}</p></div></div>
      ${S.reviews.length
        ? `<div class="carousel">${S.reviews.map(reviewCard).join("")}</div>`
        : `<div class="card empty">${ico("reviews")}<div>${esc(t("reviews_empty"))}</div></div>`}
      <button class="btn btn-outline btn-block" style="margin-top:6px" data-action="review">★ ${esc(t("leave_review"))}</button>
    </section>
    ${footer()}`;
  }

  function reviewCard(r) {
    const name = r.name || "?";
    return `<div class="card review">
      <div class="review-top"><div class="avatar">${esc(name.trim().charAt(0).toUpperCase())}</div>
        <div><b>${esc(name)}</b><small>${esc(tr(r.course))}</small></div></div>
      <div class="stars">${stars(r.rating)}</div>
      <p>${esc(tr(r.text))}</p></div>`;
  }

  function viewCourses() {
    const s = S.settings;
    const list = S.courses.filter((c) => courseFilter === "all" || c.format === courseFilter || c.format === "both");
    const tm = s.telegram ? tgHandle(s.telegram) : "";
    const ph = s.phone ? "tel:" + String(s.phone).replace(/[^\d+]/g, "") : "";
    return `
    <h1 class="page-title">${esc(t("courses_title"))}</h1>
    <p class="page-sub">${esc(t("courses_sub"))}</p>
    <div class="chips">
      ${[["all", "f_all"], ["offline", "f_offline"], ["online", "f_online"]].map(([id, k]) => `<button class="chip ${courseFilter === id ? "on" : ""}" data-filter="${id}">${esc(t(k))}</button>`).join("")}
    </div>
    <div class="stack" style="margin-top:12px">${list.map((c) => courseCard(c, true)).join("")}</div>

    <section class="section">
      <div class="section-head"><div><h2>${esc(t("tf_title"))}</h2></div></div>
      <div class="stack">${[["tf_std_t", "tf_std_s"], ["tf_int_t", "tf_int_s"], ["tf_ind_t", "tf_ind_s"]].map(([a, b]) => `<div class="card way">${ico("check")}<div><b>${esc(t(a))}</b><span>${esc(t(b))}</span></div></div>`).join("")}</div>
      <div class="note">🎁 ${esc(t("tf_all"))}</div>
    </section>

    ${teachersHtml()}

    ${faqHtml("course")}

    <section class="section"><div class="cta"><h2>${esc(t("ask_title"))}</h2><p>${esc(t("ask_text"))}</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">${tm ? `<button class="btn btn-dark" data-link="https://t.me/${esc(tm)}">💬 Telegram</button>` : ""}${ph ? `<button class="btn btn-dark" data-link="${esc(ph)}">📞 ${esc(t("call"))}</button>` : ""}</div></div></section>
    ${footer()}`;
  }

  // Konsultatsiya sahifasi (Germaniya haqida maslahat)
  function viewGermany() {
    const s = S.settings;
    return `
    <section class="g-hero">
      <div class="g-flag"><i></i><i></i><i></i></div>
      <span class="pill"><i></i>${esc(t("consult_badge", { n: consultMin() }))}</span>
      <h1 style="margin-top:12px">${esc(t("germany_title"))}</h1>
      <p>${esc(tr(s.germany_intro))}</p>
      <div class="hero-actions"><button class="btn btn-primary" data-action="consult">${esc(t("btn_consult"))}</button></div>
    </section>

    <section class="section">
      <div class="section-head"><div><h2>${esc(t("c_what"))}</h2></div></div>
      <div class="stack">${S.germany.map((g) => `<div class="card way">${ico(g.icon || "check")}<div><b>${esc(tr(g.title))}</b><span>${esc(tr(g.text))}</span></div></div>`).join("")}</div>
    </section>

    <section class="section">
      <div class="section-head"><div><h2>${esc(t("c_how"))}</h2></div></div>
      <div class="timeline">${[1, 2, 3, 4].map((i) => `<div class="tl-item"><div class="tl-n">${i}</div><div><b>${esc(t("how" + i + "_t", { n: consultMin() }))}</b><span>${esc(t("how" + i + "_s"))}</span></div></div>`).join("")}</div>
      <button class="btn btn-primary btn-block" data-action="consult">${esc(t("btn_consult"))}</button>
    </section>

    ${S.steps.length ? `<section class="section">
      <div class="section-head"><div><h2>${esc(t("germany_roadmap"))}</h2></div></div>
      <div class="timeline">${S.steps.map((st, i) => `<div class="tl-item"><div class="tl-n">${i + 1}</div><div><b>${esc(tr(st.title))}</b><span>${esc(tr(st.text))}</span></div></div>`).join("")}</div>
      <div class="note">${esc(t("germany_note"))}</div>
    </section>` : ""}

    ${faqHtml("consult")}
    ${footer()}`;
  }

  const vacType = (v) => t({ full: "vac_full", part: "vac_part", intern: "vac_intern", remote: "vac_remote" }[v] || "vac_full");

  function viewNews() {
    const vacs = S.vacancies.filter((v) => v.active !== false);
    const news = S.news.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const body = newsTab === "news"
      ? (news.length
        ? `<div class="stack">${news.map((n) => `<button class="card news-card" data-news="${n.id}">
            <div class="news-top"><span class="badge">${esc(tr(n.tag) || t("tab_news_list"))}</span><small>${ico("calendar")}${esc(I18N.date(n.date))}</small></div>
            <h3>${esc(tr(n.title))}</h3><p>${esc(tr(n.text))}</p></button>`).join("")}</div>`
        : `<div class="card empty">${esc(t("news_empty"))}</div>`)
      : (vacs.length
        ? `<div class="stack">${vacs.map((v) => `<button class="card news-card" data-vac="${v.id}">
            <div class="news-top"><span class="badge">${esc(vacType(v.type))}</span>${v.deadline ? `<small>${ico("clock")}${esc(I18N.date(v.deadline))}</small>` : ""}</div>
            <h3>${esc(tr(v.title))}</h3>
            ${tr(v.salary) ? `<p>💼 ${esc(tr(v.salary))}</p>` : ""}</button>`).join("")}</div>`
        : `<div class="card empty">${esc(t("vac_empty"))}</div>`);
    return `
    <h1 class="page-title">${esc(t("news_title"))}</h1>
    <div class="seg">
      <button data-ntab="news" class="${newsTab === "news" ? "on" : ""}">${esc(t("tab_news_list"))}</button>
      <button data-ntab="vac" class="${newsTab === "vac" ? "on" : ""}">${esc(t("tab_vac_list"))}${vacs.length ? ` (${vacs.length})` : ""}</button>
    </div>${body}${footer()}`;
  }

  function viewContact() {
    const s = S.settings;
    const rows = [];
    [s.phone, s.phone2].filter(Boolean).forEach((ph) => rows.push(["phone", t("call"), ph, "tel:" + String(ph).replace(/[^\d+]/g, "")]));
    if (s.telegram) rows.push(["telegram", "Telegram", "@" + tgHandle(s.telegram), "https://t.me/" + tgHandle(s.telegram)]);
    if (s.channel) rows.push(["telegram", "Telegram kanal", "@" + tgHandle(s.channel), "https://t.me/" + tgHandle(s.channel)]);
    if (s.instagram) rows.push(["globe", "Instagram", /^https?:/i.test(s.instagram) ? s.instagram : "@" + String(s.instagram).replace(/^@/, ""), igUrl(s.instagram)]);
    if (s.website) rows.push(["globe", "Web", s.website, webUrl(s.website)]);
    return `
    <h1 class="page-title">${esc(t("contact_title"))}</h1>
    <div style="margin-top:10px">${statusPill()}</div>
    <div class="contact-list" style="margin-top:14px">
      ${rows.map(([i, label, val, href]) => `<button class="card contact-row" data-link="${esc(href)}" style="text-align:left;width:100%">${ico(i)}<div><small>${esc(label)}</small><b>${esc(val)}</b></div></button>`).join("")}
    </div>
    <section class="section"><div class="section-head"><div><h2>${esc(t("location"))}</h2></div></div>${locationCard(true)}</section>
    <div class="cta" style="margin-top:24px"><h2>${esc(t("consult_title"))}</h2><p>${esc(t("consult_sub", { n: consultMin() }))}</p>
      <button class="btn btn-dark" data-action="consult">${esc(t("btn_consult"))}</button></div>
    ${footer()}`;
  }

  const footer = () => `<div style="text-align:center;margin-top:28px"><button class="btn btn-ghost" data-action="share">📤 ${esc(t("share_btn"))}</button></div><div class="footer" style="margin-top:14px">© ${new Date().getFullYear()} ${esc((S.settings && S.settings.name) || "Nemix")}. ${esc(t("footer"))}</div>`;

  // ---------- Render ----------
  function renderView() {
    const v = $("#view");
    if (!S) return;
    const map = { home: viewHome, courses: viewCourses, consult: viewGermany, me: () => "", news: viewNews, contact: viewContact };
    v.innerHTML = (map[route] || viewHome)();
    v.style.animation = "none"; void v.offsetWidth; v.style.animation = "";
    if (route === "me" && window.Portal) window.Portal.mount(v);
  }

  function go(r) {
    if (r === "germany") r = "consult";
    if (!TABS.some((x) => x[0] === r)) r = "home";
    route = r;
    if (location.hash !== "#/" + r) history.replaceState(null, "", "#/" + r);
    renderChrome();
    renderView();
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  // ---------- Bottom sheet ----------
  function openSheet(html) {
    closeSheet(true);
    const root = $("#overlay-root");
    root.innerHTML = `<div class="overlay" data-overlay><div class="sheet" role="dialog"><div class="grab"></div>${html}</div></div>`;
    document.body.style.overflow = "hidden";
    sheetOpen = true;
    try { tg && tg.BackButton.show(); } catch (e) {}
  }
  function closeSheet(silent) {
    const root = $("#overlay-root");
    if (root) root.innerHTML = "";
    document.body.style.overflow = "";
    sheetOpen = false;
    if (!silent) { try { tg && tg.BackButton.hide(); } catch (e) {} }
  }

  function courseSheet(id) {
    const c = S.courses.find((x) => x.id === id);
    if (!c) return;
    const d = discountPct(c);
    const outs = I18N.lines(c.outcomes);
    openSheet(`
      <div class="sheet-head"><span class="lvl">${esc(c.level)}</span><div><h2>${esc(tr(c.title))}</h2></div></div>
      <div class="meta"><span>${esc(fmtLabel(c.format))}</span><span>${esc(c.months)} ${esc(t("months"))}</span><span>${esc(c.lessons_week)} ${esc(t("lessons_week"))}</span><span>${esc(c.lesson_minutes)} ${esc(t("minutes"))}</span></div>
      <div class="price-box"><div><div class="price">${esc(I18N.price(c.price))}</div><small style="color:var(--muted);font-weight:700">${esc(unitLabel(c))}</small></div>
        <div style="text-align:right">${d ? `<span class="badge off">-${d}% ${esc(t("off"))}</span><div class="old" style="margin-top:4px">${esc(I18N.price(c.old_price))}</div>` : ""}</div></div>
      ${tariffs(c)}
      ${tr(c.discount_note) ? `<div class="note" style="margin:0 0 4px">🎁 <b>${esc(t("discount"))}:</b> ${esc(tr(c.discount_note))}</div>` : ""}
      <p style="color:var(--muted);margin-top:12px">${esc(tr(c.description))}</p>
      ${outs.length ? `<div class="h3">🎯 ${esc(t("outcomes"))}</div><ul class="check-list">${outs.map((o) => `<li>${ico("check")}<span>${esc(o)}</span></li>`).join("")}</ul>` : ""}
      ${tr(c.schedule) ? `<div class="h3">🗓 ${esc(t("schedule"))}</div><p style="color:var(--muted)">${esc(tr(c.schedule))}</p>` : ""}
      <button class="btn btn-primary btn-block" style="margin-top:20px" data-action="consult" data-course-id="${c.id}">${esc(t("enroll"))}</button>${S.settings.telegram ? `<button class="btn btn-ghost btn-block" style="margin-top:10px" data-link="https://t.me/${esc(tgHandle(S.settings.telegram))}?text=${encodeURIComponent(tr(c.title))}">💬 ${esc(t("ask_tg"))}</button>` : ""}`);
  }

  function tariffs(c) {
    const rows = [["t_std", c.price], ["t_int", c.price_int], ["t_ind", c.price_ind], ["t_indint", c.price_ind_int]].filter((r) => Number(r[1]) > 0);
    if (rows.length < 2) return "";
    return `<div class="h3">💳 ${esc(t("tariffs"))}</div><div class="card" style="padding:4px 14px">${rows.map(([k, v], i) => `<div style="display:flex;justify-content:space-between;gap:10px;padding:11px 0;${i ? "border-top:1px solid var(--line)" : ""}"><span style="font-weight:700">${esc(t(k))}</span><b>${esc(I18N.price(v))} <small style="color:var(--muted);font-weight:700">/ ${esc(unitLabel(c))}</small></b></div>`).join("")}</div>`;
  }

  function newsSheet(id) {
    const n = S.news.find((x) => x.id === id);
    if (!n) return;
    openSheet(`<span class="badge">${esc(tr(n.tag))}</span><h2 style="margin-top:10px">${esc(tr(n.title))}</h2>
      <p class="sub">${esc(I18N.date(n.date))}</p><p style="white-space:pre-line">${esc(tr(n.text))}</p>
      <button class="btn btn-ghost btn-block" style="margin-top:20px" data-close>${esc(t("close"))}</button>`);
  }

  function vacSheet(id) {
    const v = S.vacancies.find((x) => x.id === id);
    if (!v) return;
    const reqs = I18N.lines(v.requirements);
    openSheet(`<span class="badge">${esc(vacType(v.type))}</span><h2 style="margin-top:10px">${esc(tr(v.title))}</h2>
      <div class="meta" style="margin:10px 0">${tr(v.salary) ? `<span>💼 ${esc(t("salary"))}: ${esc(tr(v.salary))}</span>` : ""}${v.deadline ? `<span>⏳ ${esc(t("deadline"))}: ${esc(I18N.date(v.deadline))}</span>` : ""}</div>
      <p style="color:var(--muted);white-space:pre-line">${esc(tr(v.description))}</p>
      ${reqs.length ? `<div class="h3">${esc(t("requirements"))}</div><ul class="check-list">${reqs.map((r) => `<li>${ico("check")}<span>${esc(r)}</span></li>`).join("")}</ul>` : ""}
      <button class="btn btn-primary btn-block" style="margin-top:20px" data-apply="${v.id}">${esc(t("apply"))}</button>`);
  }

  // ---------- Formalar ----------
  function prefill() {
    const u = tgUser() || {};
    return { name: [u.first_name, u.last_name].filter(Boolean).join(" "), tg: u.username ? "@" + u.username : "" };
  }
  const honeypot = '<input class="hp" type="text" name="company_site" tabindex="-1" autocomplete="off" />';

  function consultSheet(courseId) {
    const p = prefill();
    openSheet(`<h2>${esc(t("consult_title"))}</h2><p class="sub">${esc(t("consult_sub", { n: consultMin() }))}</p>
      <form class="form" data-kind="consult" novalidate>
        <div class="field"><label>${esc(t("f_name"))}</label><input name="name" value="${esc(p.name)}" autocomplete="name" required /></div>
        <div class="field"><label>${esc(t("f_phone"))}</label><input name="phone" type="tel" inputmode="tel" placeholder="+998 __ ___ __ __" autocomplete="tel" required /></div>
        <div class="field"><label>${esc(t("f_tg"))}</label><input name="tg" value="${esc(p.tg)}" placeholder="@username" /></div>
        <div class="field"><label>${esc(t("f_course"))}</label><select name="course"><option value="">${esc(t("f_course_none"))}</option>
          ${S.courses.map((c) => `<option value="${c.id}" ${c.id === courseId ? "selected" : ""}>${esc(tr(c.title))}</option>`).join("")}</select></div>
        <div class="field"><label>${esc(t("f_time"))}</label><input name="time" placeholder="${esc(t("f_time_ph"))}" /></div>
        <div class="field"><label>${esc(t("f_comment"))}</label><textarea name="comment"></textarea></div>
        ${honeypot}<div class="err" data-err></div>
        <button class="btn btn-primary btn-block" type="submit">${esc(t("submit"))}</button>
      </form>`);
  }

  function applySheet(vacId) {
    const v = S.vacancies.find((x) => x.id === vacId);
    const p = prefill();
    openSheet(`<h2>${esc(t("apply_title"))}</h2><p class="sub">${esc(v ? tr(v.title) : "")}</p>
      <form class="form" data-kind="apply" data-vac="${esc(vacId)}" novalidate>
        <div class="field"><label>${esc(t("f_name"))}</label><input name="name" value="${esc(p.name)}" autocomplete="name" required /></div>
        <div class="field"><label>${esc(t("f_phone"))}</label><input name="phone" type="tel" inputmode="tel" placeholder="+998 __ ___ __ __" required /></div>
        <div class="field"><label>${esc(t("f_tg"))}</label><input name="tg" value="${esc(p.tg)}" placeholder="@username" /></div>
        <div class="field"><label>${esc(t("f_exp"))}</label><textarea name="experience"></textarea></div>
        <div class="field"><label>${esc(t("f_cv"))}</label><input name="cv" type="url" placeholder="https://" /></div>
        ${honeypot}<div class="err" data-err></div>
        <button class="btn btn-primary btn-block" type="submit">${esc(t("submit"))}</button>
      </form>`);
  }

  function reviewSheet() {
    const p = prefill();
    openSheet(`<h2>${esc(t("leave_review"))}</h2><p class="sub">${esc(t("reviews_sub"))}</p>
      <form class="form" data-kind="review" novalidate>
        <div class="field"><label>${esc(t("review_name"))}</label><input name="name" value="${esc(p.name)}" required /></div>
        <div class="field"><label>${esc(t("review_rating"))}</label>
          <div class="star-pick" data-stars>${[1, 2, 3, 4, 5].map((i) => `<button type="button" data-star="${i}" class="on">★</button>`).join("")}</div>
          <input type="hidden" name="rating" value="5" /></div>
        <div class="field"><label>${esc(t("review_course"))}</label><input name="course" /></div>
        <div class="field"><label>${esc(t("review_text"))}</label><textarea name="text" required></textarea></div>
        ${honeypot}<div class="err" data-err></div>
        <button class="btn btn-primary btn-block" type="submit">${esc(t("submit"))}</button>
      </form>`);
  }

  function successSheet(text) {
    openSheet(`<div class="success">${ico("check")}<h2>${esc(t("ok_title"))}</h2><p class="sub">${esc(text || t("ok_text"))}</p>
      <button class="btn btn-ghost btn-block" data-close>${esc(t("close"))}</button></div>`);
    haptic("success");
  }

  async function submitForm(form) {
    const kind = form.dataset.kind;
    const fd = new FormData(form);
    const val = (k) => String(fd.get(k) || "").trim();
    const errEl = $("[data-err]", form);
    const btn = $("button[type=submit]", form);
    const fail = (m) => { errEl.textContent = m; haptic("error"); };

    if (val("company_site")) return successSheet(); // bot tuzog'i

    const last = Number(localStorage.getItem("nemix_last_submit") || 0);
    if (Date.now() - last < 15000) return fail(t("err_wait"));

    let data;
    if (kind === "review") {
      if (val("name").length < 2 || val("text").length < 3) return fail(t("err_required"));
      data = { name: val("name"), rating: Number(val("rating")) || 5, course: val("course"), text: val("text"), lang: I18N.lang };
    } else {
      const digits = val("phone").replace(/\D/g, "");
      if (val("name").length < 2 || digits.length < 9) return fail(t("err_required"));
      const u = tgUser();
      data = { name: val("name"), phone: val("phone"), tg: val("tg"), lang: I18N.lang, tg_user: u ? { id: u.id, username: u.username || "" } : null };
      if (kind === "consult") {
        const c = S.courses.find((x) => x.id === val("course"));
        Object.assign(data, { course_id: c ? c.id : "", course: c ? I18N.tr(c.title) : "", time: val("time"), comment: val("comment") });
      } else {
        const v = S.vacancies.find((x) => x.id === form.dataset.vac);
        Object.assign(data, { vacancy_id: v ? v.id : "", vacancy: v ? I18N.tr(v.title) : "", experience: val("experience"), cv: val("cv") });
      }
    }

    errEl.textContent = "";
    btn.disabled = true; btn.textContent = t("sending");
    try {
      await DB.submit(kind, data);
      try { localStorage.setItem("nemix_last_submit", String(Date.now())); } catch (e) {}
      successSheet(kind === "review" ? t("review_thanks") : null);
    } catch (e) {
      console.error(e);
      btn.disabled = false; btn.textContent = t("submit");
      fail(t("err_send"));
    }
  }

  function shareApp() {
    const st = S.settings;
    const link = st.app_link || (location.origin + location.pathname);
    openLink("https://t.me/share/url?url=" + encodeURIComponent(link) + "&text=" + encodeURIComponent((st.name || "Nemix") + " — " + tr(st.tagline)));
  }
  function teacherSheet(id) {
    const x = (S.teachers || []).find((y) => y.id === id); if (!x) return;
    openSheet(`<div style="text-align:center">${avatarImg(x.photo, x.name, "s-photo")}<h2>${esc(x.name)}</h2>${tr(x.role) ? `<p class="sub" style="margin-bottom:10px">${esc(tr(x.role))}</p>` : ""}</div>
      <p style="color:var(--muted);white-space:pre-line">${esc(tr(x.bio))}</p>
      <button class="btn btn-ghost btn-block" style="margin-top:20px" data-close>${esc(t("close"))}</button>`);
  }
  function resultSheet(id) {
    const x = (S.results || []).find((y) => y.id === id); if (!x) return;
    openSheet(`${avatarImg(x.photo, x.name, "s-photo wide")}${tr(x.result) ? `<span class="badge">${esc(tr(x.result))}</span>` : ""}<h2 style="margin-top:8px">${esc(x.name)}${x.year ? ` · ${esc(x.year)}` : ""}</h2>
      <p style="color:var(--muted);white-space:pre-line;margin-top:10px">${esc(tr(x.text))}</p>
      <button class="btn btn-primary btn-block" style="margin-top:20px" data-action="consult">${esc(t("btn_consult"))}</button>`);
  }

  function toast(m) { const el = document.createElement("div"); el.className = "toast"; el.textContent = m; document.body.appendChild(el); setTimeout(() => el.remove(), 2000); }
  function copyText(txt) {
    const done = () => toast(t("copied"));
    const fb = () => { const ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove(); done(); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fb); else fb();
  }

  // ---------- Hodisalar ----------
  function onClick(e) {
    const el = e.target.closest("[data-nav],[data-lang],[data-action],[data-course],[data-news],[data-vac],[data-apply],[data-filter],[data-ntab],[data-link],[data-copy],[data-teacher],[data-result],[data-close],[data-star],[data-overlay]");
    if (!el) return;
    const d = el.dataset;

    if (d.overlay !== undefined && e.target !== el) return; // faqat fon bosilganda yopiladi
    if (d.overlay !== undefined) return closeSheet();
    if (d.close !== undefined) return closeSheet();
    hapticTap();
    if (d.star) {
      const n = Number(d.star);
      const box = el.parentElement;
      $$btns(box).forEach((b) => b.classList.toggle("on", Number(b.dataset.star) <= n));
      el.closest("form").elements.rating.value = n;
      return;
    }
    if (d.lang) return setLang(d.lang);
    if (d.nav) { closeSheet(); return go(d.nav); }
    if (d.filter) { courseFilter = d.filter; return renderView(); }
    if (d.ntab) { newsTab = d.ntab; return renderView(); }
    if (d.copy) return copyText(d.copy);
    if (d.link) return d.link.startsWith("tel:") ? (location.href = d.link) : openLink(d.link);
    if (d.teacher) return teacherSheet(d.teacher);
    if (d.result) return resultSheet(d.result);
    if (d.course) return courseSheet(d.course);
    if (d.news) return newsSheet(d.news);
    if (d.vac) return vacSheet(d.vac);
    if (d.apply) return applySheet(d.apply);
    if (d.action === "theme") { applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"); return renderChrome(); }
    if (d.action === "share") return shareApp();
    if (d.action === "consult") return consultSheet(d.courseId || "");
    if (d.action === "review") return reviewSheet();
  }
  const $$btns = (box) => Array.from(box.querySelectorAll("button"));

  // ---------- Boshlash ----------
  async function load() {
    $("#view").innerHTML = '<div class="spinner"></div>';
    try {
      const data = await DB.loadAll();
      const seedSettings = (window.NEMIX_SEED.settings && window.NEMIX_SEED.settings[0]) || {};
      data.settings = { ...seedSettings, ...data.settings };
      S = data;
      renderChrome();
      go((location.hash || "").replace("#/", "") || "home");
    } catch (e) {
      console.error(e);
      $("#view").innerHTML = `<div class="card empty"><p>${esc(t("load_err"))}</p><button class="btn btn-primary" style="margin-top:12px" id="retry">↻</button></div>`;
      const r = $("#retry"); if (r) r.onclick = load;
    }
  }

  function init() {
    try { if (tg) { tg.ready(); tg.expand(); tg.BackButton.onClick(() => closeSheet()); } } catch (e) {}
    initTheme();
    initLang();
    renderChrome();
    document.addEventListener("click", onClick);
    document.addEventListener("submit", (e) => { e.preventDefault(); const f = e.target.closest("form[data-kind]"); if (f) submitForm(f); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && sheetOpen) closeSheet(); });
    window.addEventListener("hashchange", () => { if (S) go((location.hash || "").replace("#/", "") || "home"); });
    load();
  }

  init();
})();
