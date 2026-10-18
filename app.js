(() => {
  const DEFAULTS = { theme: "auto", direction: "vertical", size: 30, showTr: true, showEn: true, showSrc: true };
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
    document.body.classList.toggle("horizontal", settings.direction === "horizontal");
    document.querySelector('meta[name="theme-color"]').content =
      getComputedStyle(root).getPropertyValue("--bar").trim() || "#0f5c4d";
    store.set("settings", settings);
  }

  const SECTIONS = {
    salawat: { ar: "الصَّلَوَاتُ", en: "Salawat", range: "1 – 25" },
    salaam: { ar: "السَّلَامُ", en: "Salaam", range: "26 – 40" },
  };
  const sectionHtml = (type) => {
    const s = SECTIONS[type];
    return `<header class="section-title">
      <div class="st-ar" lang="ar">${s.ar}</div>
      <div class="st-en">${s.en}</div>
      <div class="st-range">${s.range}</div>
    </header>`;
  };

  function itemHtml(it, heading = "") {
    const pending = it.source_status === "pending_verification";
    const src = settings.showSrc
      ? `<div class="src">
          ${it.source ? `<h3>Source</h3><div>${esc(it.source)}</div>` : `<h3>Source</h3><div>Reference pending verification.</div>`}
          ${it.benefits?.length ? `<h3>Virtue</h3><ul>${it.benefits.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
          ${it.note ? `<div class="note">Note: ${esc(it.note)}</div>` : ""}
        </div>`
      : "";
    return `<article class="card${it.id === current ? " current" : ""}" data-id="${it.id}">
      ${heading}
      <div class="meta">
        <span class="num">${it.id}</span>
        ${pending ? `<span class="badge pending" title="Source pending verification">Unverified source</span>` : ""}
      </div>
      <div class="ar" lang="ar">${esc(it.arabic)}</div>
      ${settings.showTr ? `<p class="tr">${esc(it.transliteration)}</p>` : ""}
      ${settings.showEn ? `<p class="en">${esc(it.translation_en)}</p>` : ""}
      ${src}
    </article>`;
  }

  function openingHtml() {
    const o = data.opening;
    return `<section class="card extra opening">
      <div class="ar" lang="ar">${esc(o.arabic)}</div>
      ${settings.showTr ? `<p class="tr">${esc(o.transliteration)}</p>` : ""}
      ${settings.showEn ? `<p class="en">${esc(o.translation_en)}</p>` : ""}
    </section>`;
  }

  function virtuesHtml() {
    const v = data.virtues_verse;
    return `<section class="card extra virtues">
      <header class="section-title small"><div class="st-en">Virtues</div></header>
      <blockquote class="verse">
        <div class="ar" lang="ar">${esc(v.arabic)}</div>
        ${settings.showEn ? `<p class="en">${esc(v.translation_en)}</p>` : ""}
        <cite>${esc(v.reference)}</cite>
      </blockquote>
      <ul>${data.collection_benefits.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
    </section>`;
  }

  function renderAbout() {
    $("aboutBody").innerHTML = `
      <p>Maulana Ashraf Ali Thanvi originally compiled the 40 Durood and Salaam from Marfu' (directly attributed) Ahadith. He published them in his book titled <em>Zadus Saeed</em> (and also referenced them in <em>Nashrut-Teeb</em>).</p>
      <p>Shaykh al-Hadith Maulana Muhammad Zakariyya Kandhlawi famously popularized and re-narrated this exact compilation. He included it at the end of his widely read book <em>Faza'il-e-Durood Shareef</em> (Virtues of Durood) to share the blessings of the compilation with a wider audience.</p>
      <p>The collection consists of 25 forms of Durood (salutations of peace) and 15 forms of Salam (greetings of peace) extracted directly from prophetic traditions.</p>
      <p>Tap any durood to mark it while you recite; the app remembers your place. Theme, text size and reading direction can be changed from the menu.</p>
      <h3 class="section-head">Note</h3>
      <p>Utmost care has been taken in compiling the text, transliteration and translation in this app. Should you find anything incorrect or not in order, kindly inform the developer so it can be corrected, in sha Allah. May Allah accept it from all of us.</p>`;
  }

  const horizontal = () => settings.direction === "horizontal";

  function render() {
    if (!data) return;
    let html = "";
    let lastType = null;
    // Section titles sit above cards 1 and 26; when reading sideways they go inside the card's page.
    for (const it of data.items) {
      const heading = it.type !== lastType ? sectionHtml(it.type) : "";
      lastType = it.type;
      if (horizontal()) html += itemHtml(it, heading);
      else html += heading + itemHtml(it);
    }
    main.innerHTML = openingHtml() + html + virtuesHtml();
  }

  // Index of the page in view when reading sideways: 0 is the opening, 1–40 the items, 41 the virtues.
  // Sideways pages run right-to-left like an Arabic book, so scrollLeft is 0 or negative.
  const pageIndex = () => Math.round(Math.abs(main.scrollLeft) / (main.clientWidth || 1));
  const goToPage = (i, behavior = "auto") => main.scrollTo({ left: -i * main.clientWidth, behavior });

  function syncPos() {
    if (horizontal()) {
      const page = pageIndex(), n = data.items.length;
      $("pagePos").textContent = page === 0 ? "Opening" : page > n ? "Virtues" : `${page} / ${n}`;
    }
    $("toTop").hidden = horizontal() ? pageIndex() === 0 : window.scrollY < window.innerHeight;
  }

  // Re-render while keeping the reader on the same durood.
  function rerender() {
    const page = horizontal() ? pageIndex() : null;
    render();
    if (page !== null) goToPage(page);
    syncPos();
  }

  function showCurrent() {
    const i = data.items.findIndex((it) => it.id === current);
    if (horizontal()) goToPage(i + 1);
    else main.querySelector(".card.current")?.scrollIntoView({ block: "center" });
    syncPos();
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
    $("dirSel").value = settings.direction;
    $("sizeRange").value = settings.size;
    $("sizeVal").textContent = settings.size + "px";
    $("showTr").checked = settings.showTr;
    $("showEn").checked = settings.showEn;
    $("showSrc").checked = settings.showSrc;
    dlg.showModal();
  };
  dlg.addEventListener("input", () => {
    const dirChanged = settings.direction !== $("dirSel").value;
    settings.theme = $("themeSel").value;
    settings.direction = $("dirSel").value;
    settings.size = Number($("sizeRange").value);
    settings.showTr = $("showTr").checked;
    settings.showEn = $("showEn").checked;
    settings.showSrc = $("showSrc").checked;
    $("sizeVal").textContent = settings.size + "px";
    applySettings();
    if (dirChanged) { render(); showCurrent(); } else rerender();
  });

  // About dialog
  const about = $("about");
  $("openAbout").onclick = () => { menu.hidden = true; about.showModal(); };

  // Share: the native share sheet where available, otherwise copy the link.
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { t.hidden = true; }, 2500);
  }
  $("shareApp").onclick = async () => {
    menu.hidden = true;
    const url = location.origin + location.pathname;
    const share = { title: "40 Salawat & Salaam", text: "Chahal Durood – 40 Salawat & Salaam to recite daily.", url };
    if (navigator.share) {
      try { await navigator.share(share); } catch {}
      return;
    }
    try { await navigator.clipboard.writeText(url); toast("Link copied"); }
    catch { prompt("Copy this link:", url); }
  };

  for (const d of [dlg, about]) d.addEventListener("click", (e) => { if (e.target === d) d.close(); });

  // Scroll-to-top button: back to the top, or to the first page when reading sideways.
  window.addEventListener("scroll", () => data && syncPos(), { passive: true });
  main.addEventListener("scroll", () => data && syncPos(), { passive: true });
  $("toTop").onclick = () => horizontal() ? goToPage(0, "smooth") : window.scrollTo({ top: 0, behavior: "smooth" });

  document.addEventListener("keydown", (e) => {
    if (!data || !horizontal() || document.querySelector("dialog[open]")) return;
    if (e.key === "ArrowLeft") goToPage(Math.min(pageIndex() + 1, data.items.length + 1), "smooth");
    if (e.key === "ArrowRight") goToPage(Math.max(pageIndex() - 1, 0), "smooth");
  });
  window.addEventListener("resize", () => { if (data && horizontal()) rerender(); });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", applySettings);

  applySettings();
  fetch("data/40_durood.json")
    .then((r) => r.json())
    .then((j) => {
      data = j;
      render();
      renderAbout();
      showCurrent();
    })
    .catch(() => { main.innerHTML = `<p class="empty">Could not load data.</p>`; });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
