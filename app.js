(() => {
  const DEFAULTS = { theme: "auto", size: 30, showTr: true, showEn: true, showSrc: true };
  const store = {
    get(k, d) { try { const v = localStorage.getItem("40ss:" + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("40ss:" + k, JSON.stringify(v)); } catch {} },
  };

  const settings = { ...DEFAULTS, ...store.get("settings", {}) };
  let current = store.get("current", null);
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

  function itemHtml(it) {
    const pending = it.source_status === "pending_verification";
    const src = settings.showSrc
      ? `<div class="src">
          ${it.source ? `<h3>Source</h3><div>${esc(it.source)}</div>` : `<h3>Source</h3><div>Reference pending verification.</div>`}
          ${it.benefits?.length ? `<h3>Virtue</h3><ul>${it.benefits.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
          ${it.note ? `<div class="note">Note: ${esc(it.note)}</div>` : ""}
        </div>`
      : "";
    return `<article class="card${it.id === current ? " current" : ""}" data-id="${it.id}">
      <div class="meta">
        <span class="num">${it.id}</span>
        <span class="badge">${esc(it.type)}</span>
        ${pending ? `<span class="badge pending" title="Source pending verification">• unverified source</span>` : ""}
      </div>
      <div class="ar" lang="ar">${esc(it.arabic)}</div>
      ${settings.showTr ? `<p class="tr">${esc(it.transliteration)}</p>` : ""}
      ${settings.showEn ? `<p class="en">${esc(it.translation_en)}</p>` : ""}
      ${src}
    </article>`;
  }

  function renderAbout() {
    const o = data.opening;
    $("aboutBody").innerHTML = `
      <p><strong>${esc(data.title)}</strong></p>
      <p>${esc(data.compiler)}.</p>
      <p>${esc(data.structure)}.</p>
      <h3 class="section-head">Opening</h3>
      <div class="ar" lang="ar">${esc(o.arabic)}</div>
      <p class="tr">${esc(o.transliteration)}</p>
      <p class="en">${esc(o.translation_en)}</p>
      <h3 class="section-head">Virtues of the collection</h3>
      <ul>${data.collection_benefits.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
      <p class="note">${esc(data.verification_note)}</p>`;
  }

  function render() {
    if (!data) return;
    let html = "";
    let lastType = null;
    for (const it of data.items) {
      if (it.type !== lastType) {
        html += `<h2 class="section-head">${it.type === "salawat" ? "Salawat (1–25)" : "Salaam (26–40)"}</h2>`;
        lastType = it.type;
      }
      html += itemHtml(it);
    }
    main.innerHTML = html;
  }

  // Tap a card to mark it as the one being read; tap it again to clear.
  main.addEventListener("click", (e) => {
    const card = e.target.closest(".card[data-id]");
    if (!card || getSelection().toString()) return;
    const id = Number(card.dataset.id);
    current = current === id ? null : id;
    store.set("current", current);
    main.querySelectorAll(".card.current").forEach((c) => c.classList.remove("current"));
    if (current) card.classList.add("current");
  });

  // Menu
  const menu = $("menu");
  $("menuBtn").onclick = (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; };
  document.addEventListener("click", (e) => { if (!menu.contains(e.target)) menu.hidden = true; });

  // Settings dialog
  const dlg = $("settings");
  $("openSettings").onclick = () => {
    menu.hidden = true;
    $("themeSel").value = settings.theme;
    $("sizeRange").value = settings.size;
    $("sizeVal").textContent = settings.size + "px";
    $("showTr").checked = settings.showTr;
    $("showEn").checked = settings.showEn;
    $("showSrc").checked = settings.showSrc;
    dlg.showModal();
  };
  dlg.addEventListener("input", () => {
    settings.theme = $("themeSel").value;
    settings.size = Number($("sizeRange").value);
    settings.showTr = $("showTr").checked;
    settings.showEn = $("showEn").checked;
    settings.showSrc = $("showSrc").checked;
    $("sizeVal").textContent = settings.size + "px";
    applySettings();
    render();
  });

  // About dialog
  const about = $("about");
  $("openAbout").onclick = () => { menu.hidden = true; about.showModal(); };

  for (const d of [dlg, about]) d.addEventListener("click", (e) => { if (e.target === d) d.close(); });

  // Scroll-to-top button, shown once the reader is past the first screen.
  const toTop = $("toTop");
  const syncToTop = () => { toTop.hidden = window.scrollY < window.innerHeight; };
  window.addEventListener("scroll", syncToTop, { passive: true });
  toTop.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", applySettings);

  applySettings();
  fetch("data/40_durood.json")
    .then((r) => r.json())
    .then((j) => {
      data = j;
      render();
      renderAbout();
      main.querySelector(".card.current")?.scrollIntoView({ block: "center" });
      syncToTop();
    })
    .catch(() => { main.innerHTML = `<p class="empty">Could not load data.</p>`; });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
