// Admin: o'quvchilar, ustozlar, guruhlar, davomat, to'lovlar, bonuslar, savollar, materiallar
(function () {
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const LV = ["A1", "A2", "B1", "B2", "C1"];
  const money = (n) => Number(n || 0).toLocaleString("ru-RU");
  const today = () => new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10);
  const shiftDay = (d, n) => { const x = new Date(d + "T00:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  const curMonth = () => today().slice(0, 7);
  const rpc = (n, a) => DB.rpc(n, a);
  let H = null, C = null, cur = "";
  const ST = { stu: { q: "", f: "all" }, att: { gid: "", from: "", only: "bad" }, pay: { m: curMonth() }, qs: { lv: "A1", q: "", n: 40 } };

  const TABS = [["dash", "📊 Boshqaruv"], ["students", "🎓 O'quvchilar"], ["tchs", "🧑‍🏫 Ustoz akkauntlari"], ["groups", "👥 Guruhlar"], ["att", "📅 Davomat"], ["pay", "💳 To'lovlar"], ["bonus", "🎁 Bonuslar"], ["quest", "📝 Savollar"], ["mats", "📚 Materiallar"]];

  // ---- umumiy yordamchilar ----
  function fld(f, v) {
    const l = `<label>${esc(f.l)}</label>`;
    if (f.t === "select") return `<div class="field">${l}<select name="${f.k}">${f.o.map(([a, b]) => `<option value="${esc(a)}" ${String(v) === String(a) ? "selected" : ""}>${esc(b)}</option>`).join("")}</select></div>`;
    if (f.t === "area") return `<div class="field">${l}<textarea name="${f.k}" ${f.rows ? `rows="${f.rows}"` : ""}>${esc(v ?? "")}</textarea></div>`;
    if (f.t === "bool") return `<div class="field check"><input type="checkbox" name="${f.k}" id="g_${f.k}" ${v ? "checked" : ""}/><label for="g_${f.k}">${esc(f.l)}</label></div>`;
    return `<div class="field">${l}<input name="${f.k}" type="${f.t || "text"}" ${f.t === "number" ? 'step="any"' : ""} value="${esc(v ?? "")}" ${f.req ? "required" : ""}/></div>`;
  }
  function ask(title, fields, init, onSave, sub) {
    H.showSheet(`<h2>${esc(title)}</h2>${sub ? `<p class="sub">${esc(sub)}</p>` : ""}<form class="form form-grid" id="a2f">${fields.map((f) => fld(f, init[f.k])).join("")}
      <div class="err" id="a2e"></div><div style="display:flex;gap:10px"><button type="button" class="btn btn-ghost" data-x style="flex:1">Bekor qilish</button><button class="btn btn-primary" style="flex:2">Saqlash</button></div></form>`);
    document.getElementById("a2f").onsubmit = (e) => {
      e.preventDefault();
      const o = {};
      fields.forEach((f) => { const el = e.target.elements[f.k]; o[f.k] = f.t === "bool" ? el.checked : f.t === "number" ? (el.value === "" ? 0 : Number(el.value)) : el.value.trim(); });
      H.guard(async () => { await onSave(o); H.closeSheet(); await go(cur); H.toast("Saqlandi ✅"); });
    };
  }
  function info(title, html) {
    H.showSheet(`<h2>${esc(title)}</h2><div style="display:grid;gap:12px;margin:12px 0">${html}</div><button class="btn btn-primary btn-block" data-x>Yopish</button>`);
  }
  const secret = (label, val) => `<div><div class="mut" style="color:var(--muted);font-size:12.5px;font-weight:700">${esc(label)}</div><div class="a2-secret">${esc(val)}</div></div>`;
  const top = (t, btn) => `<div class="a-top"><h1>${t}</h1>${btn || ""}</div>`;
  const empty = (t) => `<div class="card empty">${t}</div>`;
  const badge = (t, c) => `<span class="a2-b ${c || ""}">${esc(t)}</span>`;
  const sel = (arr, v) => arr.map(([a, b]) => `<option value="${esc(a)}" ${String(v) === String(a) ? "selected" : ""}>${esc(b)}</option>`).join("");

  async function people(role) { return DB.tList("people", { eq: { role }, order: "full_name" }); }

  // ---- Boshqaruv ----
  async function dash() {
    const [stu, tch, grp, att, pays, red] = await Promise.all([people("student"), people("teacher"), DB.tList("groups", { eq: { active: true } }), DB.tList("attendance", { eq: { day: today() } }), DB.tList("payments", { eq: { month: curMonth() } }), DB.tList("redemptions", { eq: { status: "pending" } })]);
    const act = stu.filter((s) => s.active);
    const unpaid = act.filter((s) => { const p = pays.find((x) => x.student_id === s.id); return p && p.amount_paid < p.amount_due - p.discount; }).length;
    const box = (v, l, tab) => `<button class="card a2-box" ${tab ? `data-go="${tab}"` : ""}><b>${v}</b><span>${l}</span></button>`;
    C.innerHTML = top("Boshqaruv") + `<div class="a2-grid">
      ${box(act.length, "Faol o'quvchilar", "students")}${box(act.filter((s) => !s.verified).length, "Tasdiqlanmagan", "students")}
      ${box(tch.filter((s) => s.active).length, "Ustozlar", "tchs")}${box(grp.length, "Guruhlar", "groups")}
      ${box(att.filter((a) => a.status === "absent").length, "Bugun kelmadi", "att")}${box(unpaid, "Shu oy to'lamagan", "pay")}
      ${box(red.length, "Bonus so'rovlari", "bonus")}</div>
      <div class="card tool"><h3>Qisqacha yo'riqnoma</h3><p>1) «Ustoz akkauntlari»da ustoz yarating — login/parolni unga bering. 2) Ustoz <b>teacher.html</b> sahifasidan kirib guruh va davomat yuritadi. 3) O'quvchilar ilovada o'zlari ro'yxatdan o'tadi — siz «O'quvchilar»da tasdiqlaysiz. 4) Oy boshida «To'lovlar»da oy uchun yozuvlarni yarating.</p></div>`;
  }

  // ---- O'quvchilar ----
  async function students() {
    const [all, groups] = await Promise.all([people("student"), DB.tList("groups", {})]);
    const gn = (id) => (groups.find((g) => g.id === id) || {}).name || "—";
    const s = ST.stu, q = s.q.toLowerCase();
    let list = all.filter((x) => (s.f === "all" || (s.f === "new" && !x.verified) || (s.f === "off" && !x.active)) && (!q || (x.full_name + " " + (x.phone || "")).toLowerCase().includes(q)));
    const total = list.length; list = list.slice(0, 100);
    C.innerHTML = top("O'quvchilar (" + all.length + ")", `<button class="btn btn-primary btn-sm" id="add">+ O'quvchi</button>`) +
      `<div class="a2-bar"><input id="sq" placeholder="Ism yoki telefon…" value="${esc(s.q)}"/><select id="sf">${sel([["all", "Hammasi"], ["new", "Tasdiqlanmagan"], ["off", "Nofaol"]], s.f)}</select></div>
      <div class="a-list">${list.map((x) => `<div class="card row"><div class="grow"><b>${esc(x.full_name)} ${x.verified ? "" : badge("yangi", "w")}${x.active ? "" : badge("nofaol", "r")}</b>
        <small>${esc(x.phone || "")} · ${esc(x.level)} · ${esc(gn(x.group_id))}${x.source === "self" ? " · o'zi ro'yxatdan o'tgan" : ""}</small></div>
        <div class="acts">${x.verified ? "" : `<button class="btn btn-primary btn-sm" data-ver="${x.id}">✔ Tasdiqlash</button>`}<button class="btn btn-ghost btn-sm" data-ed="${x.id}">✏️</button><button class="btn btn-ghost btn-sm" data-code="${x.id}" title="Yangi kirish kodi">🔑</button></div></div>`).join("") || empty("O'quvchi topilmadi")}</div>
      ${total > 100 ? `<p class="mut" style="color:var(--muted);text-align:center">Dastlabki 100 ta ko'rsatilmoqda. Qidiruvdan foydalaning.</p>` : ""}`;
    const sq = document.getElementById("sq");
    sq.oninput = () => { ST.stu.q = sq.value; clearTimeout(sq._t); sq._t = setTimeout(() => students().then(() => { const n = document.getElementById("sq"); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }), 250); };
    document.getElementById("sf").onchange = (e) => { ST.stu.f = e.target.value; students(); };
    const gopt = [["", "— guruhsiz —"]].concat(groups.filter((g) => g.active).map((g) => [g.id, g.name + " (" + g.level + ")"]));
    const F = [{ k: "full_name", l: "Ism-familiya", req: true }, { k: "phone", l: "Telefon" }, { k: "level", l: "Daraja", t: "select", o: LV.map((l) => [l, l]) }, { k: "group_id", l: "Guruh", t: "select", o: gopt }, { k: "note", l: "Izoh (faqat admin)", t: "area", rows: 2 }, { k: "active", l: "Faol", t: "bool" }];
    document.getElementById("add").onclick = () => ask("Yangi o'quvchi", F.slice(0, 4), { level: "A1" }, async (o) => {
      const r = await rpc("a_create_student", { p_name: o.full_name, p_phone: o.phone, p_level: o.level, p_group: o.group_id || null });
      if (!r.ok) throw new Error("Ism kamida 2 harf bo'lsin");
      setTimeout(() => info("O'quvchi qo'shildi", secret("Kirish kodi (o'quvchiga bering)", r.code.match(/.{1,4}/g).join(" "))), 50);
    });
    C.querySelectorAll("[data-ver]").forEach((b) => (b.onclick = () => H.guard(async () => { await DB.tUpdateWhere("people", { verified: true }, "id", b.dataset.ver); await students(); H.toast("Tasdiqlandi ✅"); })));
    C.querySelectorAll("[data-ed]").forEach((b) => (b.onclick = () => { const x = all.find((y) => y.id === b.dataset.ed); ask("Tahrirlash", F, { ...x, group_id: x.group_id || "" }, async (o) => { await DB.tSave("people", { id: x.id, full_name: o.full_name, phone: o.phone, level: o.level, group_id: o.group_id || null, note: o.note, active: o.active }); }); }));
    C.querySelectorAll("[data-code]").forEach((b) => (b.onclick = () => H.guard(async () => { if (!confirm("Yangi kod beriladi, eski qurilmalar chiqib ketadi. Davom etamizmi?")) return; const r = await rpc("a_new_code", { p_id: b.dataset.code }); if (r.ok) info("Yangi kirish kodi", secret("Kod", r.code.match(/.{1,4}/g).join(" "))); })));
  }

  // ---- Ustoz akkauntlari ----
  async function tchs() {
    const [all, groups] = await Promise.all([people("teacher"), DB.tList("groups", {})]);
    C.innerHTML = top("Ustoz akkauntlari", `<button class="btn btn-primary btn-sm" id="add">+ Ustoz</button>`) +
      `<p class="mut" style="color:var(--muted)">Ustozlar <b>teacher.html</b> sahifasidan login va parol bilan kiradi. Bu sahifa o'quvchilarga ko'rinmaydi.</p>
      <div class="a-list">${all.map((x) => `<div class="card row"><div class="grow"><b>${esc(x.full_name)} ${x.active ? "" : badge("nofaol", "r")}</b><small>login: ${esc(x.login)} · ${groups.filter((g) => g.teacher_id === x.id && g.active).length} ta guruh</small></div>
        <div class="acts"><button class="btn btn-ghost btn-sm" data-pw="${x.id}">🔑 Yangi parol</button><button class="btn btn-ghost btn-sm" data-tg="${x.id}">${x.active ? "⏸" : "▶"}</button></div></div>`).join("") || empty("Hali ustoz yo'q")}</div>`;
    document.getElementById("add").onclick = () => ask("Yangi ustoz", [{ k: "name", l: "Ism-familiya", req: true }, { k: "phone", l: "Telefon" }], {}, async (o) => {
      const r = await rpc("a_create_teacher", { p_name: o.name, p_phone: o.phone });
      if (!r.ok) throw new Error("Ism kamida 2 harf bo'lsin");
      setTimeout(() => info("Ustoz yaratildi", secret("Login", r.login) + secret("Parol", r.password) + `<p class="mut" style="color:var(--muted)">Parol faqat hozir ko'rsatiladi. Ustozga bering — u keyin o'zgartira oladi.</p>`), 50);
    });
    C.querySelectorAll("[data-pw]").forEach((b) => (b.onclick = () => H.guard(async () => { if (!confirm("Yangi parol beriladi. Davom etamizmi?")) return; const r = await rpc("a_reset_password", { p_id: b.dataset.pw }); if (r.ok) info("Yangi parol", secret("Login", r.login) + secret("Parol", r.password)); })));
    C.querySelectorAll("[data-tg]").forEach((b) => (b.onclick = () => H.guard(async () => { const x = all.find((y) => y.id === b.dataset.tg); await DB.tUpdateWhere("people", { active: !x.active }, "id", x.id); await tchs(); })));
  }

  // ---- Guruhlar ----
  async function groups() {
    const [gs, tch, stu] = await Promise.all([DB.tList("groups", { order: "name" }), people("teacher"), people("student")]);
    const tn = (id) => (tch.find((t) => t.id === id) || {}).full_name || "ustozsiz";
    C.innerHTML = top("Guruhlar", `<button class="btn btn-primary btn-sm" id="add">+ Guruh</button>`) +
      `<div class="a-list">${gs.map((g) => `<div class="card row"><div class="grow"><b>${esc(g.name)} · ${esc(g.level)} ${g.active ? "" : badge("yopiq", "r")}</b><small>${esc(tn(g.teacher_id))} · ${esc(g.schedule || "jadval yo'q")} · ${stu.filter((s) => s.group_id === g.id).length} ta o'quvchi</small></div>
        <div class="acts"><button class="btn btn-ghost btn-sm" data-ed="${g.id}">✏️</button></div></div>`).join("") || empty("Guruh yo'q. Ustoz yoki siz yarata olasiz.")}</div>`;
    const F = [{ k: "name", l: "Guruh nomi", req: true }, { k: "level", l: "Daraja", t: "select", o: LV.map((l) => [l, l]) }, { k: "teacher_id", l: "Ustoz", t: "select", o: [["", "— ustozsiz —"]].concat(tch.filter((t) => t.active).map((t) => [t.id, t.full_name])) }, { k: "schedule", l: "Dars jadvali" }, { k: "active", l: "Faol", t: "bool" }];
    const save = (id) => async (o) => { await DB.tSave("groups", { ...(id ? { id } : {}), name: o.name, level: o.level, teacher_id: o.teacher_id || null, schedule: o.schedule, active: o.active }); };
    document.getElementById("add").onclick = () => ask("Yangi guruh", F, { level: "A1", active: true }, save());
    C.querySelectorAll("[data-ed]").forEach((b) => (b.onclick = () => { const g = gs.find((x) => x.id === b.dataset.ed); ask("Guruhni tahrirlash", F, { ...g, teacher_id: g.teacher_id || "" }, save(g.id)); }));
  }

  // ---- Davomat (sabablar bilan) ----
  async function att() {
    const s = ST.att; if (!s.from) s.from = shiftDay(today(), -14);
    const [rows, gs, stu] = await Promise.all([DB.tList("attendance", { gte: { day: s.from }, order: "day", asc: false }), DB.tList("groups", {}), people("student")]);
    const sn = (id) => (stu.find((x) => x.id === id) || {}).full_name || "?";
    const gn = (id) => (gs.find((x) => x.id === id) || {}).name || "—";
    const list = rows.filter((r) => (!s.gid || r.group_id === s.gid) && (s.only === "all" || r.status !== "present"));
    const lab = { present: ["Keldi", "g"], late: ["Kechikdi", "w"], absent: ["Kelmadi", "r"] };
    C.innerHTML = top("Davomat") + `<div class="a2-bar"><select id="ag">${sel([["", "Barcha guruhlar"]].concat(gs.map((g) => [g.id, g.name])), s.gid)}</select>
      <input type="date" id="af" value="${s.from}"/><select id="ao">${sel([["bad", "Kelmaganlar/kechikkanlar"], ["all", "Hammasi"]], s.only)}</select></div>
      <div class="a-list">${list.slice(0, 300).map((r) => `<div class="card row"><div class="grow"><b>${esc(sn(r.student_id))} ${badge(lab[r.status][0], lab[r.status][1])}</b>
        <small>${esc(r.day)} · ${esc(gn(r.group_id))}${r.reason ? " · <b>Sabab:</b> " + esc(r.reason) : r.status !== "present" ? " · sabab yozilmagan" : ""}</small></div>
        <div class="acts"><button class="btn btn-ghost btn-sm" data-rs="${r.id}">✏️</button></div></div>`).join("") || empty("Yozuv yo'q")}</div>`;
    document.getElementById("ag").onchange = (e) => { s.gid = e.target.value; att(); };
    document.getElementById("af").onchange = (e) => { s.from = e.target.value || s.from; att(); };
    document.getElementById("ao").onchange = (e) => { s.only = e.target.value; att(); };
    C.querySelectorAll("[data-rs]").forEach((b) => (b.onclick = () => { const r = rows.find((x) => x.id === b.dataset.rs); ask("Davomatni tahrirlash — " + sn(r.student_id), [{ k: "status", l: "Holat", t: "select", o: [["present", "Keldi"], ["late", "Kechikdi"], ["absent", "Kelmadi"]] }, { k: "reason", l: "Sabab (faqat admin ko'radi)", t: "area", rows: 2 }], r, async (o) => { await DB.tSave("attendance", { id: r.id, status: o.status, reason: o.status === "present" ? null : o.reason || null }); }); }));
  }

  // ---- To'lovlar ----
  async function pay() {
    const m = ST.pay.m;
    const [stu, ps, gs] = await Promise.all([people("student"), DB.tList("payments", { eq: { month: m } }), DB.tList("groups", {})]);
    const act = stu.filter((s) => s.active);
    const gn = (id) => (gs.find((x) => x.id === id) || {}).name || "—";
    let sum = { due: 0, paid: 0 };
    const rows = act.map((s) => { const p = ps.find((x) => x.student_id === s.id); if (p) { sum.due += p.amount_due - p.discount; sum.paid += p.amount_paid; } return { s, p }; });
    const stt = (p) => !p ? ["yozuv yo'q", ""] : p.amount_paid >= p.amount_due - p.discount ? ["to'langan", "g"] : p.amount_paid > 0 ? ["qisman", "w"] : ["to'lanmagan", "r"];
    C.innerHTML = top("To'lovlar", `<button class="btn btn-primary btn-sm" id="mk">Oy uchun yozuv yaratish</button>`) +
      `<div class="a2-bar"><input type="month" id="pm" value="${m}"/></div>
      <div class="card tool"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><span>Jami to'lov: <b>${money(sum.due)}</b></span><span>To'langan: <b>${money(sum.paid)}</b></span><span>Qoldi: <b>${money(Math.max(0, sum.due - sum.paid))}</b></span></div></div>
      <div class="a-list">${rows.map(({ s, p }) => { const t = stt(p); return `<div class="card row"><div class="grow"><b>${esc(s.full_name)} ${badge(t[0], t[1])}</b><small>${esc(gn(s.group_id))}${p ? " · " + money(p.amount_due) + (p.discount ? " − " + money(p.discount) : "") + " / to'langan " + money(p.amount_paid) : ""}</small></div>
        <div class="acts"><button class="btn btn-ghost btn-sm" data-ed="${s.id}">✏️</button></div></div>`; }).join("") || empty("Faol o'quvchi yo'q")}</div>`;
    document.getElementById("pm").onchange = (e) => { if (e.target.value) { ST.pay.m = e.target.value; pay(); } };
    document.getElementById("mk").onclick = () => ask("Oy uchun yozuv yaratish", [{ k: "due", l: "Oylik to'lov summasi (so'm)", t: "number" }], { due: 700000 }, async (o) => {
      const need = act.filter((s) => !ps.find((p) => p.student_id === s.id));
      if (!need.length) throw new Error("Hammada yozuv bor");
      await DB.tInsert("payments", need.map((s) => ({ student_id: s.id, month: m, amount_due: o.due })));
    }, m + " oyi uchun yozuvi yo'q barcha faol o'quvchilarga yaratiladi. Keyin har birini alohida tahrirlash mumkin.");
    C.querySelectorAll("[data-ed]").forEach((b) => (b.onclick = () => {
      const s = act.find((x) => x.id === b.dataset.ed), p = ps.find((x) => x.student_id === s.id) || { amount_due: 700000, discount: 0, amount_paid: 0 };
      ask(s.full_name + " — " + m, [{ k: "amount_due", l: "To'lov summasi", t: "number" }, { k: "discount", l: "Chegirma", t: "number" }, { k: "amount_paid", l: "To'langan", t: "number" }, { k: "paid_at", l: "To'lov sanasi", t: "date" }, { k: "note", l: "Izoh" }], p, async (o) => {
        await DB.tSave("payments", { ...(p.id ? { id: p.id } : { student_id: s.id, month: m }), amount_due: o.amount_due, discount: o.discount, amount_paid: o.amount_paid, paid_at: o.paid_at || null, note: o.note || null });
      });
    }));
  }

  // ---- Bonuslar ----
  async function bonus() {
    const [rd, stu, cfg] = await Promise.all([DB.tList("redemptions", { order: "created_at", asc: false }), people("student"), DB.tList("app_config", {})]);
    const sn = (id) => (stu.find((x) => x.id === id) || {}).full_name || "?";
    const cv = (k) => (cfg.find((c) => c.key === k) || {}).value || "";
    const lab = { pending: ["Kutilmoqda", "w"], approved: ["Tasdiqlangan", "g"], rejected: ["Rad etilgan", "r"] };
    C.innerHTML = top("Bonuslar", `<button class="btn btn-ghost btn-sm" id="cfg">⚙️ Qoidalar</button>`) +
      `<p class="mut" style="color:var(--muted)">Hozirgi qoida: <b>${cv("bonus_stars")} ⭐ = ${money(cv("bonus_amount"))} so'm</b>, kuniga ko'pi bilan ${cv("daily_cap")} ⭐. Tasdiqlaganda summa shu oydagi to'lov chegirmasiga qo'shiladi.</p>
      <div class="a-list">${rd.map((r) => `<div class="card row"><div class="grow"><b>${esc(sn(r.student_id))} ${badge(lab[r.status][0], lab[r.status][1])}</b><small>${r.stars} ⭐ → ${money(r.amount)} so'm · ${esc(String(r.created_at).slice(0, 10))}</small></div>
        <div class="acts">${r.status === "pending" ? `<button class="btn btn-primary btn-sm" data-ok="${r.id}">✔</button><button class="btn btn-danger btn-sm" data-no="${r.id}">✖</button>` : ""}</div></div>`).join("") || empty("So'rovlar yo'q")}</div>`;
    document.getElementById("cfg").onclick = () => ask("Bonus qoidalari", [{ k: "bonus_stars", l: "Bonus uchun kerakli ⭐ soni", t: "number" }, { k: "bonus_amount", l: "Bonus miqdori (so'm)", t: "number" }, { k: "daily_cap", l: "Kuniga ko'pi bilan ⭐", t: "number" }, { k: "set_size", l: "Bir martalik test savollari soni", t: "number" }],
      { bonus_stars: cv("bonus_stars"), bonus_amount: cv("bonus_amount"), daily_cap: cv("daily_cap"), set_size: cv("set_size") }, async (o) => {
        for (const k of ["bonus_stars", "bonus_amount", "daily_cap", "set_size"]) { if (!(o[k] >= 1)) throw new Error("Qiymat 1 dan kam bo'lmasin"); await DB.tUpdateWhere("app_config", { value: String(Math.round(o[k])) }, "key", k); }
      });
    C.querySelectorAll("[data-no]").forEach((b) => (b.onclick = () => H.guard(async () => { await DB.tUpdateWhere("redemptions", { status: "rejected", decided_at: new Date().toISOString() }, "id", b.dataset.no); await bonus(); })));
    C.querySelectorAll("[data-ok]").forEach((b) => (b.onclick = () => H.guard(async () => {
      const r = rd.find((x) => x.id === b.dataset.ok);
      const ps = await DB.tList("payments", { eq: { student_id: r.student_id, month: curMonth() } });
      if (!ps.length) { H.toast("Avval «To'lovlar»da shu oy uchun yozuv yarating"); return; }
      await DB.tUpdateWhere("payments", { discount: ps[0].discount + r.amount }, "id", ps[0].id);
      await DB.tUpdateWhere("redemptions", { status: "approved", decided_at: new Date().toISOString() }, "id", r.id);
      await bonus(); H.toast("Chegirma qo'shildi ✅");
    })));
  }

  // ---- Savollar ----
  async function quest() {
    const s = ST.qs;
    const all = await DB.tList("questions", { eq: { level: s.lv }, order: "created_at" });
    const q = s.q.toLowerCase();
    const list = all.filter((x) => !q || x.q.toLowerCase().includes(q));
    C.innerHTML = top("Savollar", `<div style="display:flex;gap:8px"><button class="btn btn-ghost btn-sm" id="imp">⬆ Ko'plab qo'shish</button><button class="btn btn-primary btn-sm" id="add">+ Savol</button></div>`) +
      `<div class="a2-bar"><select id="ql">${sel(LV.map((l) => [l, l + " (" + ((s.cnt && s.cnt[l]) || "") + ")"].slice(0, 1).concat([l])), s.lv)}</select><input id="qq" placeholder="Qidirish…" value="${esc(s.q)}"/></div>
      <p class="mut" style="color:var(--muted)">${s.lv} darajada ${all.length} ta savol. Bonusga erishish uchun o'quvchiga kamida ${"300"} ta savol kerak — kam bo'lsa, shu yerdan qo'shing.</p>
      <div class="a-list">${list.slice(0, s.n).map((x) => `<div class="card row"><div class="grow"><b>${esc(x.q)} ${x.active ? "" : badge("o'chirilgan", "r")}</b><small>${x.options.map((o, i) => (i === x.answer ? "✔ " : "") + esc(o)).join(" · ")}</small></div><div class="acts"><button class="btn btn-ghost btn-sm" data-ed="${x.id}">✏️</button><button class="btn btn-danger btn-sm" data-rm="${x.id}">🗑</button></div></div>`).join("") || empty("Savol topilmadi")}</div>
      ${list.length > s.n ? `<button class="btn btn-ghost btn-block" id="more">Yana ko'rsatish (${list.length - s.n})</button>` : ""}`;
    document.getElementById("ql").onchange = (e) => { s.lv = e.target.value; s.n = 40; quest(); };
    const qq = document.getElementById("qq");
    qq.oninput = () => { s.q = qq.value; clearTimeout(qq._t); qq._t = setTimeout(() => quest().then(() => { const n = document.getElementById("qq"); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }), 250); };
    const more = document.getElementById("more"); if (more) more.onclick = () => { s.n += 80; quest(); };
    const F = [{ k: "level", l: "Daraja", t: "select", o: LV.map((l) => [l, l]) }, { k: "q", l: "Savol", t: "area", rows: 2, req: true }, { k: "o0", l: "Variant A" }, { k: "o1", l: "Variant B" }, { k: "o2", l: "Variant C" }, { k: "o3", l: "Variant D" }, { k: "answer", l: "To'g'ri javob", t: "select", o: [[0, "A"], [1, "B"], [2, "C"], [3, "D"]] }, { k: "explain", l: "Izoh (ixtiyoriy)" }, { k: "active", l: "Faol", t: "bool" }];
    const save = (id) => async (o) => {
      const opts = [o.o0, o.o1, o.o2, o.o3];
      if (!o.q || opts.some((x) => !x)) throw new Error("Savol va 4 ta variant to'ldirilsin");
      if (new Set(opts).size < 4) throw new Error("Variantlar bir xil bo'lmasin");
      await DB.tSave("questions", { ...(id ? { id } : {}), level: o.level, q: o.q, options: opts, answer: Number(o.answer), explain: o.explain || null, active: o.active });
    };
    document.getElementById("add").onclick = () => ask("Yangi savol", F, { level: s.lv, answer: 0, active: true }, save());
    C.querySelectorAll("[data-ed]").forEach((b) => (b.onclick = () => { const x = all.find((y) => y.id === b.dataset.ed); ask("Savolni tahrirlash", F, { ...x, o0: x.options[0], o1: x.options[1], o2: x.options[2], o3: x.options[3] }, save(x.id)); }));
    C.querySelectorAll("[data-rm]").forEach((b) => (b.onclick = () => H.guard(async () => { if (!confirm("Savol o'chirilsinmi?")) return; await DB.tRemove("questions", b.dataset.rm); await quest(); })));
    document.getElementById("imp").onclick = () => ask("Ko'plab savol qo'shish", [{ k: "text", l: "Har qatorda bitta savol", t: "area", rows: 9 }], { text: "" }, async (o) => {
      const have = new Set((await DB.tList("questions", {})).map((x) => x.level + "|" + x.q));
      const out = []; let bad = 0;
      o.text.split("\n").map((l) => l.trim()).filter(Boolean).forEach((line) => {
        const p = line.split("|").map((x) => x.trim());
        const ans = Number(p[6]) - 1;
        if (p.length < 7 || !LV.includes(p[0]) || !p[1] || p.slice(2, 6).some((x) => !x) || new Set(p.slice(2, 6)).size < 4 || !(ans >= 0 && ans <= 3)) { bad++; return; }
        if (have.has(p[0] + "|" + p[1])) return; have.add(p[0] + "|" + p[1]);
        out.push({ level: p[0], q: p[1], options: p.slice(2, 6), answer: ans, explain: p[7] || null });
      });
      for (let i = 0; i < out.length; i += 200) await DB.tInsert("questions", out.slice(i, i + 200));
      H.toast(out.length + " ta qo'shildi" + (bad ? ", " + bad + " ta qator noto'g'ri" : ""));
    }, "Format: DARAJA | savol | A | B | C | D | to'g'ri javob raqami (1-4) | izoh. Masalan: A1 | Ich ___ Anna. | bin | bist | ist | sind | 1 | ich bin");
  }

  // ---- Materiallar ----
  async function mats() {
    const all = await DB.tList("materials", { order: "position" });
    C.innerHTML = top("Materiallar", `<button class="btn btn-primary btn-sm" id="add">+ Material</button>`) +
      `<p class="mut" style="color:var(--muted)">O'quvchi kabinetidagi «O'rganish» bo'limida ko'rinadi (video, PDF, sayt havolasi).</p>
      <div class="a-list">${all.map((x) => `<div class="card row"><div class="pos">${x.position}</div><div class="grow"><b>${esc(x.title)} ${x.active ? "" : badge("yashirin", "r")}</b><small>${esc(x.level === "ALL" ? "Hamma daraja" : x.level)} · ${esc(x.url || "")}</small></div><div class="acts"><button class="btn btn-ghost btn-sm" data-ed="${x.id}">✏️</button><button class="btn btn-danger btn-sm" data-rm="${x.id}">🗑</button></div></div>`).join("") || empty("Material yo'q")}</div>`;
    const F = [{ k: "title", l: "Nomi", req: true }, { k: "url", l: "Havola (https://…)", t: "url" }, { k: "level", l: "Daraja", t: "select", o: [["ALL", "Hamma daraja"]].concat(LV.map((l) => [l, l])) }, { k: "note", l: "Qisqa izoh" }, { k: "position", l: "Tartib raqami", t: "number" }, { k: "active", l: "Ko'rinsin", t: "bool" }];
    const save = (id) => async (o) => { if (o.url && !/^https?:\/\//i.test(o.url)) throw new Error("Havola https:// bilan boshlansin"); await DB.tSave("materials", { ...(id ? { id } : {}), title: o.title, url: o.url || null, level: o.level, note: o.note || null, position: Math.round(o.position) || 0, active: o.active }); };
    document.getElementById("add").onclick = () => ask("Yangi material", F, { level: "ALL", position: all.length + 1, active: true }, save());
    C.querySelectorAll("[data-ed]").forEach((b) => (b.onclick = () => { const x = all.find((y) => y.id === b.dataset.ed); ask("Tahrirlash", F, { ...x, url: x.url || "" }, save(x.id)); }));
    C.querySelectorAll("[data-rm]").forEach((b) => (b.onclick = () => H.guard(async () => { if (!confirm("O'chirilsinmi?")) return; await DB.tRemove("materials", b.dataset.rm); await mats(); })));
  }

  const VIEWS = { dash, students, tchs, groups, att, pay, bonus, quest, mats };
  async function go(tab) {
    cur = tab;
    try { await VIEWS[tab](); } catch (e) { console.error(e); C.innerHTML = `<div class="card empty">Yuklab bo'lmadi: ${esc(e.message || e)}<br><small>portal.sql Supabase'da bajarilganmi?</small></div>`; return; }
    C.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => { H.setTab(b.dataset.go); }));
  }
  window.Admin2 = {
    tabs: TABS,
    has: (id) => !!VIEWS[id],
    render(tab, container, helpers) {
      H = helpers; C = container;
      if (DB.mode === "demo") { C.innerHTML = `<div class="card empty">Bu bo'lim faqat Supabase ulangan holatda ishlaydi.</div>`; return; }
      C.innerHTML = '<div class="spinner"></div>';
      go(tab);
    }
  };
})();
