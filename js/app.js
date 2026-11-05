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
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>'
  };

  const TABS = [
    ["home", "tab_home", "home"],
    ["courses", "tab_courses", "book"],
    ["germany", "tab_germany", "flag"],
    ["news", "tab_news", "news"],
    ["contact", "tab_contact", "chat"]
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
    $("#tabbar").innerHTML = TABS.map(([id, key, icon]) => `<button class="tab ${route === id ? "on" : ""}" data-nav="${id}">${SVG[icon]}<span>${esc(t(key))}</span></button>`).join("") + `<a class="tab portal-tab" href="portal.html" aria-label="O‘quvchi kabineti"><span class="portal-tab-icon">🎓</span><span>Kabinet</span></a>`;
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
      <div class="hero-art"><span class="chip-float a">A1 → C1</span><span class="chip-float b">🇩🇪 Germaniya</span>${ico("teacher")}</div>
    </section>
    <div class="stats">${stats}</div>

    <section class="section">
      <div class="section-head"><div><h2>${esc(t("about_title"))}</h2></div></div>
      <div class="card about">${esc(tr(s.about))}</div>
    </section>

    ${popular.length ? `<section class="section">
      <div class="section-head"><div><h2>🔥 ${esc(t("popular_title"))}</h2></div><button class="link" data-nav="courses">${esc(t("btn_all_courses"))} →</button></div>
      <div class="carousel">${popular.map((c) => courseCard(c)).join("")}</div>
    </section>` : ""}

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

    <section class="section">
      <div class="section-head"><div><h2>${esc(t("reviews_title"))}</h2><p>${esc(t("reviews_sub"))}</p></div></div>
      ${S.reviews.length
        ? `<div class="carousel">${S.reviews.map(reviewCard).join("")}</div>`
        : `<div class="card empty">${ico("reviews")}<div>${esc(t("reviews_empty"))}</div></div>`}
      <button class="btn btn-outline btn-block" style="margin-top:6px" data-action="review">★ ${esc(t("leave_review"))}</button>
    </section>

    <section class="section">
      <div class="section-head"><div><h2>📍 Bizning manzil</h2><p>Nemix nemis tili markaziga tashrif buyuring</p></div></div>
      <div class="card" style="padding:16px">
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px">
          ${ico("pin")}
          <div><b>${esc(tr(s.address))}</b><p style="color:var(--muted);font-size:13px;margin-top:5px">41.290634, 69.179546</p></div>
        </div>
        <div class="hero-actions">
          <button class="btn btn-primary" data-link="https://www.google.com/maps/dir/?api=1&destination=41.290634,69.179546">Google Maps</button>
          <button class="btn btn-dark" data-link="https://yandex.com/maps/?rtext=~41.290634,69.179546">Yandex Maps</button>
        </div>
      </div>
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
    const list = S.courses.filter((c) => courseFilter === "all" || c.format === courseFilter || c.format === "both");
    return `
    <h1 class="page-title">${esc(t("courses_title"))}</h1>
    <p class="page-sub">${esc(t("courses_sub"))}</p>
    <div class="chips">
      ${[["all", "f_all"], ["offline", "f_offline"], ["online", "f_online"]].map(([id, k]) => `<button class="chip ${courseFilter === id ? "on" : ""}" data-filter="${id}">${esc(t(k))}</button>`).join("")}
    </div>
    <div class="stack" style="margin-top:12px">${list.map((c) => courseCard(c, true)).join("")}</div>
    ${footer()}`;
  }

  function viewGermany() {
    const s = S.settings;
    return `
    <section class="g-hero">
      <div class="g-flag"><i></i><i></i><i></i></div>
      <h1>${esc(t("germany_title"))}</h1>
      <p>${esc(tr(s.germany_intro))}</p>
      <div class="hero-actions"><button class="btn btn-primary" data-action="consult">${esc(t("btn_consult"))}</button></div>
    </section>
    <section class="section">
      <div class="section-head"><div><h2>${esc(t("germany_ways"))}</h2></div></div>
      <div class="stack">${S.germany.map((g) => `<div class="card way">${ico(g.icon || "check")}<div><b>${esc(tr(g.title))}</b><span>${esc(tr(g.text))}</span></div></div>`).join("")}</div>
    </section>
    ${S.steps.length ? `<section class="section">
      <div class="section-head"><div><h2>${esc(t("germany_roadmap"))}</h2></div></div>
      <div class="timeline">${S.steps.map((st, i) => `<div class="tl-item"><div class="tl-n">${i + 1}</div><div><b>${esc(tr(st.title))}</b><span>${esc(tr(st.text))}</span></div></div>`).join("")}</div>
      <div class="note">${esc(t("germany_note"))}</div>
    </section>` : ""}
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
    if (s.instagram) rows.push(["globe", "Instagram", s.instagram, igUrl(s.instagram)]);
    if (s.website) rows.push(["globe", "Web", s.website, webUrl(s.website)]);
    if (tr(s.address)) rows.push(["pin", t("address"), tr(s.address), s.map_url || ""]);
    if (tr(s.hours)) rows.push(["clock", t("hours"), tr(s.hours), ""]);
    return `
    <h1 class="page-title">${esc(t("contact_title"))}</h1>
    <div class="contact-list" style="margin-top:14px">
      ${rows.map(([i, label, val, href]) => `<${href ? "button" : "div"} class="card contact-row" ${href ? `data-link="${esc(href)}" style="text-align:left;width:100%"` : ""}>${ico(i)}<div><small>${esc(label)}</small><b>${esc(val)}</b></div></${href ? "button" : "div"}>`).join("")}
    </div>
    <div class="cta" style="margin-top:20px"><h2>${esc(t("consult_title"))}</h2><p>${esc(t("consult_sub", { n: consultMin() }))}</p>
      <button class="btn btn-dark" data-action="consult">${esc(t("btn_consult"))}</button></div>
    ${footer()}`;
  }

  const footer = () => `<div class="footer">© ${new Date().getFullYear()} ${esc((S.settings && S.settings.name) || "Nemix")}. ${esc(t("footer"))}</div>`;

  // ---------- Render ----------
  function renderView() {
    const v = $("#view");
    if (!S) return;
    const map = { home: viewHome, courses: viewCourses, germany: viewGermany, news: viewNews, contact: viewContact };
    v.innerHTML = (map[route] || viewHome)();
    v.style.animation = "none"; void v.offsetWidth; v.style.animation = "";
  }

  function go(r) {
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
      <button class="btn btn-primary btn-block" style="margin-top:20px" data-action="consult" data-course-id="${c.id}">${esc(t("enroll"))}</button>`);
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

  // ---------- Hodisalar ----------
  function onClick(e) {
    const el = e.target.closest("[data-nav],[data-lang],[data-action],[data-course],[data-news],[data-vac],[data-apply],[data-filter],[data-ntab],[data-link],[data-close],[data-star],[data-overlay]");
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
    if (d.link) return d.link.startsWith("tel:") ? (location.href = d.link) : openLink(d.link);
    if (d.course) return courseSheet(d.course);
    if (d.news) return newsSheet(d.news);
    if (d.vac) return vacSheet(d.vac);
    if (d.apply) return applySheet(d.apply);
    if (d.action === "theme") { applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"); return renderChrome(); }
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
