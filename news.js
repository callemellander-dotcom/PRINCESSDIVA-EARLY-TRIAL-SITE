// news.js — render admin-published news on index + news page
(function () {
  const ADMIN_NEWS_KEY = "newsItems";        // used by admin.js
  const LEGACY_KEY = "princess_diva_news";  // older homepage key

  function getLang() {
    return (localStorage.getItem("siteLang") || document.documentElement.lang || "en")
      .toLowerCase()
      .startsWith("sv") ? "sv" : "en";
  }

  function loadNewsFrom(key) {
    try {
      const items = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  }

  function loadNews() {
    const adminItems = loadNewsFrom(ADMIN_NEWS_KEY);
    if (adminItems.length) return adminItems;

    const legacyItems = loadNewsFrom(LEGACY_KEY);
    if (legacyItems.length) return legacyItems;

    return [{
      id: (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
      title: "Trial website launched",
      date: "2025-12-03",
      body: "Welcome to the PRINCESS-DIVA Trial website. News updates will appear here."
    }];
  }

  function sortNews(items) {
    return items.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }

  function renderNewsInto(container, items, limit = null) {
    if (!container) return;

    const lang = getLang();
    const noNewsText = lang === "sv" ? "Inga nyheter publicerade ännu." : "No news published yet.";

    container.innerHTML = "";
    if (!items.length) {
      container.innerHTML = `<p class="muted">${noNewsText}</p>`;
      return;
    }

    const show = limit ? items.slice(0, limit) : items;

    show.forEach(item => {
      const div = document.createElement("div");
      div.className = "news-item";
      div.innerHTML = `
        <h3>${item.title || ""}</h3>
        ${item.date ? `<div class="muted" style="margin-bottom:.35rem;">${item.date}</div>` : ""}
        ${item.image ? `<img src="${item.image}" alt="" class="news-image">` : ""}
        <p>${item.body || ""}</p>
      `;
      container.appendChild(div);
    });
  }

  function renderAll() {
    const items = sortNews(loadNews());

    // Index page heuristic: has .hero section
    const isIndex = !!document.querySelector(".hero");
    const indexContainer = document.getElementById("news-feed");
    if (indexContainer) {
      renderNewsInto(indexContainer, items, isIndex ? 3 : null);
    }

    // If you later add another container for full list, we support it:
    const fullContainer = document.getElementById("news-feed-full") || document.getElementById("news-list-full");
    if (fullContainer) {
      renderNewsInto(fullContainer, items, null);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderAll();
    window.addEventListener("storage", (e) => {
      if (e.key === ADMIN_NEWS_KEY || e.key === LEGACY_KEY) {
        renderAll();
      }
    });
  });
})();
