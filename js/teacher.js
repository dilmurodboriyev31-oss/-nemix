// Ustozlar paneli (alohida kirish). Faqat login va parol bilan.
(function () {
  const LS = "nemix_ttoken";
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} };
  try { const m = get("nemix_theme"); if (m === "light") document.documentElement.dataset.theme = "light"; } catch (e) {}

  const St = { data: null, view: "login", gid: null, day: null, rows: {}, err: "", busy: false, free: [] };
  const tk = () => get(LS);
  const call = async (fn, a) => { try { return await DB.rpc(fn, a); } catch (e) { return { ok: false, error: "net" }; } };
  const toast = (m) => { const el = document.createElement("div"); el.className = "toast"; el.textContent = m; document.body.appendChild(el); setTimeout(() => el.remove(), 2200); };
  const LV = ["A1", "A2", "B1", "B2", "C1"];
  const ST = { present: "Keldi", late: "Kechikdi", absent: "Kelmadi" };

  function top(extra) {
    return `<div class="tch-top"><img src="images/logo.png" alt="" /><b>${esc(St.data ? St.data.name : "Nemix · Ustozlar")}</b>${extra || ""}</div>`;
  }
  function loginView() {
    return `${top()}<div class="card"><h2>Ustozlar uchun kirish</h2><p class="mut">Login va parolni markaz administratori beradi.</p>
      <form data-f="login" style="display:grid;gap:10px">
        <div class="field"><label>Login</label><input name="login" autocomplete="username" autocapitalize="off" required /></div>
        <div class="field"><label>Parol</label><input name="password" type="password" autocomplete="current-password" required /></div>
        ${St.err ? `<div class="err">${esc(St.err)}</div>` : ""}
        <button class="btn btn-primary btn-block" ${St.busy ? "disabled" : ""}>Kirish</button></form></div>`;
  }
  function homeView() {
    const d = St.data;
    const gs = d.groups.map((g) => `<button class="grp" data-a="open" data-id="${g.id}"><b>${esc(g.name)} · ${esc(g.level)}</b><span class="mut">${esc(g.schedule || "Jadval kiritilmagan")} · ${g.students.length} ta o'quvchi</span></button>`).join("");
    return `${top(`<button class="btn btn-ghost sm" data-a="logout">Chiqish</button>`)}
      <div class="row"><h2>Guruhlarim</h2><button class="btn btn-primary sm" data-a="newgroup">+ Guruh</button></div>
      ${gs || `<div class="card"><p class="mut">Hali guruh yo'q. "+ Guruh" tugmasi bilan yarating.</p></div>`}
      <button class="btn btn-outline btn-block" data-a="pwd">Parolni o'zgartirish</button>`;
  }
  function groupFormView() {
    const g = St.gid ? St.data.groups.find((x) => x.id === St.gid) : null;
    return `${top()}<div class="card"><h2>${g ? "Guruhni tahrirlash" : "Yangi guruh"}</h2>
      <form data-f="group" style="display:grid;gap:10px">
        <div class="field"><label>Guruh nomi</label><input name="name" value="${esc(g ? g.name : "")}" maxlength="80" required /></div>
        <div class="field"><label>Daraja</label><select name="level">${LV.map((l) => `<option ${g && g.level === l ? "selected" : ""}>${l}</option>`).join("")}</select></div>
        <div class="field"><label>Dars jadvali (masalan: Du-Chor-Ju 18:00)</label><input name="schedule" value="${esc(g ? g.schedule || "" : "")}" maxlength="200" /></div>
        ${St.err ? `<div class="err">${esc(St.err)}</div>` : ""}
        <button class="btn btn-primary btn-block">Saqlash</button>
        <button type="button" class="btn btn-ghost btn-block" data-a="${g ? "open" : "home"}" data-id="${g ? g.id : ""}">Bekor qilish</button>
        ${g ? `<button type="button" class="btn btn-outline btn-block" data-a="delgroup">Guruhni o'chirish</button>` : ""}</form></div>`;
  }
  function groupView() {
    const g = St.data.groups.find((x) => x.id === St.gid);
    if (!g) return homeView();
    const stu = g.students.map((s) => {
      const r = St.rows[s.id] || {};
      const bt = ["present", "late", "absent"].map((k) => `<button type="button" class="${k} ${r.status === k ? "on" : ""}" data-a="st" data-id="${s.id}" data-v="${k}">${ST[k]}</button>`).join("");
      return `<div class="stu"><b>${esc(s.name)}</b><div class="seg">${bt}</div>
        ${r.status && r.status !== "present" ? `<input data-reason="${s.id}" value="${esc(r.reason || "")}" placeholder="Sababi (faqat admin ko'radi)" maxlength="300" />` : ""}</div>`;
    }).join("");
    return `${top(`<button class="btn btn-ghost sm" data-a="home">‹ Orqaga</button>`)}
      <div class="card"><div class="row"><h2>${esc(g.name)} · ${esc(g.level)}</h2><button class="btn btn-ghost sm" data-a="editgroup">Tahrir</button></div>
        <span class="mut">${esc(g.schedule || "")}</span></div>
      <div class="card"><h3>Davomat</h3>
        <div class="field"><label>Sana</label><input type="date" data-day value="${St.day}" min="${shift(St.data.today, -30)}" max="${St.data.today}" /></div>
        ${stu || `<p class="mut">Guruhda o'quvchi yo'q. Pastdan qo'shing.</p>`}
        ${g.students.length ? `<button class="btn btn-primary btn-block" data-a="saveatt" ${St.busy ? "disabled" : ""}>Davomatni saqlash</button>` : ""}
        <p class="mut">Sabab faqat markaz administratoriga ko'rinadi.</p></div>
      <button class="btn btn-outline btn-block" data-a="members">O'quvchilarni boshqarish</button>`;
  }
  function membersView() {
    const g = St.data.groups.find((x) => x.id === St.gid);
    const list = g.students.map((s) => ({ ...s, on: true })).concat(St.data.free.map((s) => ({ ...s, on: false })));
    const sel = St.sel;
    return `${top()}<div class="card"><h2>${esc(g.name)}: o'quvchilar</h2>
      <p class="mut">Faqat markaz tasdiqlagan va boshqa guruhda bo'lmagan o'quvchilarni qo'shish mumkin.</p>
      ${list.map((s) => `<label class="chk"><input type="checkbox" data-sel="${s.id}" ${sel.has(s.id) ? "checked" : ""}/> ${esc(s.name)} <span class="mut">${esc(s.level)}</span></label>`).join("") || `<p class="mut">Hozircha mos o'quvchi yo'q.</p>`}
      <button class="btn btn-primary btn-block" data-a="savemembers">Saqlash</button>
      <button class="btn btn-ghost btn-block" data-a="open" data-id="${g.id}">Bekor qilish</button></div>`;
  }
  function pwdView() {
    return `${top()}<div class="card"><h2>Parolni o'zgartirish</h2><form data-f="pwd" style="display:grid;gap:10px">
      <div class="field"><label>Eski parol</label><input name="old" type="password" required /></div>
      <div class="field"><label>Yangi parol (kamida 6 belgi)</label><input name="nw" type="password" minlength="6" required /></div>
      ${St.err ? `<div class="err">${esc(St.err)}</div>` : ""}
      <button class="btn btn-primary btn-block">Saqlash</button>
      <button type="button" class="btn btn-ghost btn-block" data-a="home">Bekor qilish</button></form></div>`;
  }
  function shift(day, n) { const d = new Date(day + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }

  function render() {
    const v = { login: loginView, home: homeView, group: groupView, gform: groupFormView, members: membersView, pwd: pwdView }[St.view];
    $("#tch").innerHTML = (St.data || St.view === "login" ? v() : "") || `<div class="spinner"></div>`;
  }

  async function load(keep) {
    if (!tk()) { St.view = "login"; St.data = null; return render(); }
    const r = await call("t_overview", { p_token: tk() });
    if (r && r.ok) { St.data = r; if (!keep) St.view = "home"; }
    else if (r && r.error === "net") { St.err = "Aloqa xatosi"; St.view = "login"; }
    else { set(LS, null); St.data = null; St.view = "login"; }
    render();
  }
  async function loadAtt() {
    St.rows = {};
    const r = await call("t_att_get", { p_token: tk(), p_group: St.gid, p_day: St.day });
    if (r && r.ok) r.items.forEach((x) => (St.rows[x.student_id] = { status: x.status, reason: "" }));
  }

  document.addEventListener("click", async (e) => {
    const el = e.target.closest("[data-a]"); if (!el) return;
    const a = el.dataset.a, id = el.dataset.id, v = el.dataset.v;
    if (a === "home") { St.view = "home"; St.err = ""; return render(); }
    if (a === "open") { St.gid = id || St.gid; St.day = St.data.today; St.view = "group"; await loadAtt(); return render(); }
    if (a === "newgroup") { St.gid = null; St.view = "gform"; St.err = ""; return render(); }
    if (a === "editgroup") { St.view = "gform"; St.err = ""; return render(); }
    if (a === "pwd") { St.view = "pwd"; St.err = ""; return render(); }
    if (a === "logout") { await call("p_logout", { p_token: tk() }); set(LS, null); St.data = null; St.view = "login"; return render(); }
    if (a === "st") { const r = St.rows[id] || (St.rows[id] = {}); r.status = v; if (v === "present") r.reason = ""; return render(); }
    if (a === "saveatt") {
      const rows = Object.keys(St.rows).filter((k) => St.rows[k].status).map((k) => ({ student_id: k, status: St.rows[k].status, reason: St.rows[k].reason || "" }));
      if (!rows.length) return toast("Avval belgilang");
      St.busy = true; render();
      const r = await call("t_att_save", { p_token: tk(), p_group: St.gid, p_day: St.day, p_rows: rows });
      St.busy = false; render();
      return toast(r && r.ok ? "Saqlandi ✓" : "Xatolik: saqlanmadi");
    }
    if (a === "members") { await load(true); const g = St.data.groups.find((x) => x.id === St.gid); St.sel = new Set(g.students.map((s) => s.id)); St.view = "members"; return render(); }
    if (a === "savemembers") {
      const r = await call("t_set_members", { p_token: tk(), p_group: St.gid, p_ids: [...St.sel] });
      if (r && r.ok) { toast("Saqlandi ✓"); await load(true); St.view = "group"; await loadAtt(); return render(); }
      return toast("Xatolik");
    }
    if (a === "delgroup") {
      if (!confirm("Guruh o'chirilsinmi? O'quvchilar guruhsiz qoladi.")) return;
      const r = await call("t_delete_group", { p_token: tk(), p_id: St.gid });
      if (r && r.ok) { St.view = "home"; await load(); } else toast("Xatolik");
    }
  });
  document.addEventListener("input", (e) => {
    const rs = e.target.dataset && e.target.dataset.reason;
    if (rs) { (St.rows[rs] || (St.rows[rs] = {})).reason = e.target.value; }
  });
  document.addEventListener("change", async (e) => {
    const t = e.target;
    if (t.dataset && t.dataset.sel) { t.checked ? St.sel.add(t.dataset.sel) : St.sel.delete(t.dataset.sel); }
    if (t.dataset && "day" in t.dataset && t.value) { St.day = t.value; await loadAtt(); render(); }
  });
  document.addEventListener("submit", async (e) => {
    const f = e.target.closest("[data-f]"); if (!f) return;
    e.preventDefault(); const fd = new FormData(f); St.err = "";
    if (f.dataset.f === "login") {
      St.busy = true; render();
      const r = await call("p_login", { p_login: fd.get("login"), p_password: fd.get("password") });
      St.busy = false;
      if (r && r.ok) { set(LS, r.token); return load(); }
      St.err = r && r.error === "locked" ? "Juda ko'p urinish. 15 daqiqadan so'ng qayta urinib ko'ring." : r && r.error === "net" ? "Aloqa xatosi" : "Login yoki parol noto'g'ri";
      return render();
    }
    if (f.dataset.f === "group") {
      const r = await call("t_save_group", { p_token: tk(), p_id: St.gid, p_name: fd.get("name"), p_level: fd.get("level"), p_schedule: fd.get("schedule") });
      if (r && r.ok) { St.gid = r.id; await load(true); St.day = St.data.today; St.view = "group"; await loadAtt(); return render(); }
      St.err = "Saqlanmadi. Ma'lumotni tekshiring."; return render();
    }
    if (f.dataset.f === "pwd") {
      const r = await call("t_change_password", { p_token: tk(), p_old: fd.get("old"), p_new: fd.get("nw") });
      if (r && r.ok) { toast("Parol o'zgartirildi ✓"); St.view = "home"; return render(); }
      St.err = r && r.error === "wrong_old" ? "Eski parol noto'g'ri" : "Yangi parol juda qisqa"; return render();
    }
  });

  if (DB.mode === "demo") { $("#tch").innerHTML = `<div class="card"><h2>Ustozlar paneli</h2><p class="mut">Faqat Supabase ulangan holatda ishlaydi.</p></div>`; }
  else load();
})();
