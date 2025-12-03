const STORAGE_KEY = "princess_diva_news";

function getNews() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [
      {
        id: crypto.randomUUID(),
        title: "Trial website launched",
        date: "2025-12-03",
        body: "Welcome to the PRINCESS-DIVA Trial website. News updates will appear here."
      }
    ];
  }
  try { return JSON.parse(raw); } catch { return []; }
}

function saveNews(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function renderNews(containerId = "news-feed") {
  const el = document.getElementById(containerId);
  if (!el) return;

  const items = getNews()
    .slice()
    .sort((a,b) => (b.date || "").localeCompare(a.date || ""));

  el.innerHTML = "";
  if (items.length === 0) {
    el.innerHTML = "<p class='muted'>No news yet.</p>";
    return;
  }

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "news-item";
    div.innerHTML = `
      <h3>${item.title}</h3>
      <div class="muted" style="margin-bottom:.35rem;">${item.date}</div>
      <p>${item.body}</p>
    `;
    el.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", () => renderNews());
