// Ma'lumotlar qatlami: Supabase (haqiqiy) yoki DEMO (localStorage)
(function () {
  const C = window.NEMIX_CONFIG || {};
  const hasSb = !!(C.SUPABASE_URL && C.SUPABASE_ANON_KEY && window.supabase);
  const sb = hasSb ? window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY) : null;

  const LS_C = "nemix_demo_content_v2";
  const LS_S = "nemix_demo_subs_v2";
  const SS_A = "nemix_demo_admin";
  const COLLECTIONS = ["settings", "features", "courses", "germany", "steps", "news", "vacancies", "reviews"];

  const uid = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  const lsGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  function seedRows() {
    const rows = [];
    const now = Date.now();
    COLLECTIONS.forEach((col) => {
      (window.NEMIX_SEED[col] || []).forEach((item, i) => {
        const { position, ...data } = item;
        rows.push({ id: uid(), collection: col, position: position ?? i + 1, data, created_at: new Date(now + i).toISOString() });
      });
    });
    return rows;
  }

  function demoRows() {
    let rows = lsGet(LS_C, null);
    if (!rows) { rows = seedRows(); lsSet(LS_C, rows); }
    return rows;
  }

  function group(rows) {
    const out = {};
    COLLECTIONS.forEach((c) => (out[c] = []));
    rows
      .slice()
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || String(a.created_at).localeCompare(String(b.created_at)))
      .forEach((r) => {
        if (!out[r.collection]) return;
        out[r.collection].push({ ...r.data, id: r.id, position: r.position ?? 0, created_at: r.created_at });
      });
    out.settings = out.settings[0] || {};
    return out;
  }

  const DB = {
    mode: hasSb ? "supabase" : "demo",
    COLLECTIONS,

    async loadAll() {
      if (!hasSb) return group(demoRows());
      const { data, error } = await sb.from("content").select("*").order("position", { ascending: true }).order("created_at", { ascending: true });
      if (error) throw error;
      return group(data || []);
    },

    async save(collection, item) {
      const { id, position, created_at, ...data } = item;
      const pos = Number(position) || 0;
      if (!hasSb) {
        const rows = demoRows();
        if (id) {
          const r = rows.find((x) => x.id === id);
          if (r) { r.data = data; r.position = pos; }
        } else {
          rows.push({ id: uid(), collection, position: pos || rows.filter((x) => x.collection === collection).length + 1, data, created_at: new Date().toISOString() });
        }
        lsSet(LS_C, rows);
        return;
      }
      if (id) {
        const { error } = await sb.from("content").update({ data, position: pos }).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("content").insert({ collection, data, position: pos || 99 });
        if (error) throw error;
      }
    },

    async remove(id) {
      if (!hasSb) { lsSet(LS_C, demoRows().filter((r) => r.id !== id)); return; }
      const { error } = await sb.from("content").delete().eq("id", id);
      if (error) throw error;
    },

    // Mijoz yuborgan ariza: kind = consult | apply | review
    async submit(kind, data) {
      if (!hasSb) {
        const subs = lsGet(LS_S, []);
        subs.unshift({ id: uid(), kind, status: "new", data, created_at: new Date().toISOString() });
        lsSet(LS_S, subs);
        return;
      }
      const { error } = await sb.from("submissions").insert({ kind, data });
      if (error) throw error;
    },

    async submissions() {
      if (!hasSb) return lsGet(LS_S, []);
      const { data, error } = await sb.from("submissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },

    async updateSubmission(id, patch) {
      if (!hasSb) {
        lsSet(LS_S, lsGet(LS_S, []).map((s) => (s.id === id ? { ...s, ...patch } : s)));
        return;
      }
      const { error } = await sb.from("submissions").update(patch).eq("id", id);
      if (error) throw error;
    },

    async removeSubmission(id) {
      if (!hasSb) { lsSet(LS_S, lsGet(LS_S, []).filter((s) => s.id !== id)); return; }
      const { error } = await sb.from("submissions").delete().eq("id", id);
      if (error) throw error;
    },

    // Namuna ma'lumotlarni yuklash (faqat bo'sh bo'lsa)
    async seedIfEmpty() {
      const all = await this.loadAll();
      const has = COLLECTIONS.some((c) => (c === "settings" ? Object.keys(all.settings).length : all[c].length));
      if (has) return false;
      if (!hasSb) { lsSet(LS_C, seedRows()); return true; }
      const rows = seedRows().map(({ collection, position, data }) => ({ collection, position, data }));
      const { error } = await sb.from("content").insert(rows);
      if (error) throw error;
      return true;
    },

    resetDemo() { try { localStorage.removeItem(LS_C); localStorage.removeItem(LS_S); } catch (e) {} },

    // --- Admin kirish ---
    async session() {
      if (!hasSb) return sessionStorage.getItem(SS_A) === "1" ? { email: C.DEMO_ADMIN.email } : null;
      const { data } = await sb.auth.getSession();
      return data.session ? { email: data.session.user.email } : null;
    },
    async login(email, password) {
      if (!hasSb) {
        const a = C.DEMO_ADMIN || {};
        if (email === a.email && password === a.password) { sessionStorage.setItem(SS_A, "1"); return; }
        throw new Error("Login yoki parol noto'g'ri");
      }
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw new Error("Login yoki parol noto'g'ri");
    },
    async logout() {
      if (!hasSb) { sessionStorage.removeItem(SS_A); return; }
      await sb.auth.signOut();
    }
  };

  window.DB = DB;
})();
