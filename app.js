(() => {
  const DEFAULTS = { theme: "auto", layout: "cards", size: 30, showTr: true, showEn: true, showSrc: true };
  const store = {
    get(k, d) { try { const v = localStorage.getItem("40ss:" + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("40ss:" + k, JSON.stringify(v)); } catch {} },
  };

  const settings = { ...DEFAULTS, ...store.get("settings", {}) };
  let filter = "all";
  let data = null;

  const $ = (id) => document.getElementById(id);
  const main = $("main");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function applySettings() {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.style.setProperty("--ar-size", settings.size + "px");
    document.querySelector('meta[name="theme-color"]').content =
      getComputedStyle(root).getPropertyValue("--bar").trim() || "#0f5c4d";
    store.set("settings", settings);
  }

  function visibleItems() {
    return filter === "all" ? data.items : data.items.filter((it) => it.type === filter);
  }

  function itemHtml(it, { full, link }) {
    const pending = it.source_status === "pending_verification";
    const src = settings.showSrc && full
      ? `<div class="src">
          ${it.source ? `<h3>Source</h3><div>${esc(it.source)}</div>` : `<h3>Source</h3><div>Reference pending verification.</div>`}
          ${it.benefits?.length ? `<h3>Virtue</h3><ul>${it.benefits.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
          ${it.note ? `<div class="note">Note: ${esc(it.note)}</div>` : ""}
        </div>`
      : "";
    return `<article class="card${link ? " link" : ""}" data-id="${it.id}">
      <div class="meta">
        <span class="num">${it.id}</span>
        <span class="badge">${esc(it.type)}</span>
        ${pending ? `<span class="badge pending" title="Source pending verification">• unverified source</span>` : ""}
      </div>
      <div class="ar${full ? "" : " clip"}" lang="ar">${esc(it.arabic)}</div>
      ${full && settings.showTr ? `<p class="tr">${esc(it.transliteration)}</p>` : ""}
      ${settings.showEn ? `<p class="en${full ? "" : " clip"}">${esc(it.translation_en)}</p>` : ""}
      ${src}
    </article>`;
  }

  function introHtml() {
    const o = data.opening;
    return `<details class="card intro">
      <summary>About &amp; opening</summary>
      <p><strong>${esc(data.title)}</strong></p>
      <p>${esc(data.compiler)}.</p>
      <p>${esc(data.structure)}.</p>
      <h3 class="section-head">Opening</h3>
      <div class="ar" lang="ar">${esc(o.arabic)}</div>
      ${settings.showTr ? `<p class="tr">${esc(o.transliteration)}</p>` : ""}
      ${settings.showEn ? `<p class="en">${esc(o.translation_en)}</p>` : ""}
      <h3 class="section-head">Virtues of the collection</h3>
      <ul>${data.collection_benefits.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
      <p class="note">${esc(data.verification_note)}</p>
    </details>`;
  }

  function renderList() {
    const items = visibleItems();
    const full = settings.layout === "full";
    let html = filter === "all" ? introHtml() : "";
    let lastType = null;
    for (const it of items) {
      if (filter === "all" && it.type !== lastType) {
        html += `<h2 class="section-head">${it.type === "salawat" ? "Salawat (1–25)" : "Salaam (26–40)"}</h2>`;
        lastType = it.type;
      }
      html += itemHtml(it, { full, link: !full });
    }
    main.innerHTML = html;
  }

  function renderDetail(id) {
    const it = data.items.find((x) => x.id === id);
    if (!it) { location.hash = ""; return; }
    main.innerHTML = `<div class="detail">${itemHtml(it, { full: true, link: false })}</div>`;
    $("pos").textContent = `${id} / ${data.items.length}`;
    $("prevBtn").disabled = id <= 1;
    $("nextBtn").disabled = id >= data.items.length;
  }

  let lastRoute = null;
  function render() {
    if (!data) return;
    const m = location.hash.match(/^#\/(\d+)$/);
    const detail = m ? Number(m[1]) : null;
    $("backBtn").hidden = !detail;
    $("tabs").hidden = !!detail;
    $("pager").hidden = !detail;
    $("title").textContent = detail ? `Durood ${detail}` : "40 Salawat & Salaam";
    const route = location.hash;
    detail ? renderDetail(detail) : renderList();
    if (route !== lastRoute && detail) window.scrollTo(0, 0);
    lastRoute = route;
  }

  // Opening from the list pushes history; prev/next replace it so Back always returns to the list.
  let fromList = false;
  const go = (id) => { fromList = true; location.hash = `#/${id}`; };
  const step = (id) => location.replace(`#/${id}`);

  // Events
  main.addEventListener("click", (e) => {
    const card = e.target.closest(".card.link");
    if (card) go(Number(card.dataset.id));
  });

  $("tabs").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-filter]");
    if (!b) return;
    filter = b.dataset.filter;
    document.querySelectorAll("#tabs button").forEach((x) => x.classList.toggle("active", x === b));
    render();
  });

  $("backBtn").onclick = () => {
    if (fromList) { fromList = false; history.back(); }
    else location.replace("#");
  };
  $("prevBtn").onclick = () => { const m = location.hash.match(/\d+/); if (m && +m[0] > 1) step(+m[0] - 1); };
  $("nextBtn").onclick = () => { const m = location.hash.match(/\d+/); if (m && +m[0] < data.items.length) step(+m[0] + 1); };

  // Swipe left/right in the detail view.
  let tx = null, ty = null;
  main.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  main.addEventListener("touchend", (e) => {
    if (tx === null || $("pager").hidden) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    tx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? $("nextBtn") : $("prevBtn")).click();
  });

  // Settings dialog
  const dlg = $("settings");
  $("settingsBtn").onclick = () => {
    $("themeSel").value = settings.theme;
    $("layoutSel").value = settings.layout;
    $("sizeRange").value = settings.size;
    $("sizeVal").textContent = settings.size + "px";
    $("showTr").checked = settings.showTr;
    $("showEn").checked = settings.showEn;
    $("showSrc").checked = settings.showSrc;
    dlg.showModal();
  };
  dlg.addEventListener("input", () => {
    settings.theme = $("themeSel").value;
    settings.layout = $("layoutSel").value;
    settings.size = Number($("sizeRange").value);
    settings.showTr = $("showTr").checked;
    settings.showEn = $("showEn").checked;
    settings.showSrc = $("showSrc").checked;
    $("sizeVal").textContent = settings.size + "px";
    applySettings();
    render();
  });
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

  window.addEventListener("hashchange", render);
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", applySettings);

  applySettings();
  fetch("data/40_durood.json")
    .then((r) => r.json())
    .then((j) => { data = j; render(); })
    .catch(() => { main.innerHTML = `<p class="empty">Could not load data.</p>`; });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
