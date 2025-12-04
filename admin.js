// admin.js — PRINCESS-DIVA admin dashboard (with images)
// - Password-protected per session (sessionStorage)
// - Patients count stored in localStorage under "patientsCount"
// - News CRUD stored in localStorage under "newsItems"
// - Each news item can include optional image URL/dataURL

(function () {
  const PASSWORD = "December2025";
  const AUTH_KEY = "adminAuthedSession";   // session-only auth
  const PATIENTS_KEY = "patientsCount";
  const NEWS_KEY = "newsItems";

  function qs(sel) { return document.querySelector(sel); }

  function showDashboard() {
    qs("#login-box").style.display = "none";
    qs("#dashboard").style.display = "block";
  }

  function showLogin() {
    qs("#login-box").style.display = "block";
    qs("#dashboard").style.display = "none";
  }

  function applyAuthUI() {
    const authed = sessionStorage.getItem(AUTH_KEY) === "true";
    authed ? showDashboard() : showLogin();
  }

  function login() {
    const input = qs("#admin-password");
    const val = (input?.value || "").trim();
    if (val === PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "true");
      applyAuthUI();
    } else {
      alert("Wrong password.");
      input.value = "";
      input.focus();
    }
  }

  function logout() {
    sessionStorage.setItem(AUTH_KEY, "false");
    applyAuthUI();
  }

  function loadPatients() {
    const n = parseInt(localStorage.getItem(PATIENTS_KEY) || "0", 10);
    const field = qs("#patients-count");
    if (field) field.value = Number.isFinite(n) ? n : 0;
  }

  function savePatients() {
    const field = qs("#patients-count");
    const n = parseInt(field?.value || "0", 10);
    localStorage.setItem(PATIENTS_KEY, String(Number.isFinite(n) ? n : 0));
    alert("Patient count saved.");
  }

  function loadNewsRaw() {
    try {
      const items = JSON.parse(localStorage.getItem(NEWS_KEY) || "[]");
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  }

  function normalizeNews(items) {
    // Ensure every item has a stable id so edit/delete works
    let changed = false;
    const norm = items.map(it => {
      if (!it || typeof it !== "object") return null;
      if (!it.id) {
        it.id = (crypto?.randomUUID?.() ?? String(Date.now() + Math.random()));
        changed = true;
      }
      if (!("image" in it)) it.image = ""; // ensure field exists
      return it;
    }).filter(Boolean);

    if (changed) localStorage.setItem(NEWS_KEY, JSON.stringify(norm));
    return norm;
  }

  function loadNews() {
    return normalizeNews(loadNewsRaw());
  }

  function saveNews(items) {
    localStorage.setItem(NEWS_KEY, JSON.stringify(items));
  }

  function renderNewsList() {
    const list = qs("#admin-news-list");
    if (!list) return;
    const items = loadNews()
      .sort((a,b) => (b.date||"").localeCompare(a.date||""));

    list.innerHTML = "";
    if (!items.length) {
      list.innerHTML = `<p class="muted">No news items yet.</p>`;
      return;
    }

    items.forEach(item => {
      const card = document.createElement("div");
      card.className = "news-item";
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:.5rem;align-items:center;">
          <div>
            <h4 style="margin:.1rem 0">${item.title || ""}</h4>
            <div class="muted">${item.date || ""}</div>
          </div>
          <div style="display:flex;gap:.4rem;">
            <button class="button button-outline" data-act="edit" data-id="${item.id}">Edit</button>
            <button class="button button-outline" data-act="delete" data-id="${item.id}">Delete</button>
          </div>
        </div>
        ${item.image ? `<img src="${item.image}" alt="" style="max-width:100%;border-radius:10px;margin-top:.5rem;">` : ""}
        <p style="margin-top:.5rem">${item.body || ""}</p>
      `;
      list.appendChild(card);
    });
  }

  function resetForm() {
    qs("#news-id").value = "";
    qs("#news-title").value = "";
    qs("#news-date").value = "";
    qs("#news-body").value = "";
    qs("#news-image").value = "";
    qs("#news-image-file").value = "";
    qs("#news-cancel").style.display = "none";
  }

  function fillForm(item) {
    qs("#news-id").value = item.id;
    qs("#news-title").value = item.title || "";
    qs("#news-date").value = item.date || "";
    qs("#news-body").value = item.body || "";
    qs("#news-image").value = item.image || "";
    qs("#news-cancel").style.display = "inline-block";
  }

  function upsertNews(e) {
    e.preventDefault();
    const idField = qs("#news-id");
    const title = qs("#news-title").value.trim();
    const date  = qs("#news-date").value;
    const body  = qs("#news-body").value.trim();
    const image = qs("#news-image").value.trim();

    let items = loadNews();
    const id = idField.value || (crypto?.randomUUID?.() ?? String(Date.now()));

    const obj = { id, title, date, body, image: image || "" };

    const existingIdx = items.findIndex(x => x.id === id);
    if (existingIdx >= 0) items[existingIdx] = obj;
    else items.push(obj);

    saveNews(items);
    resetForm();
    renderNewsList();
  }

  function handleNewsListClick(e) {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const act = btn.dataset.act;
    const id  = btn.dataset.id;

    let items = loadNews();
    const idx = items.findIndex(x => x.id === id);
    if (idx < 0) return;

    if (act === "edit") {
      fillForm(items[idx]);
      qs("#news-form").scrollIntoView({ behavior:"smooth", block:"start" });
    }

    if (act === "delete") {
      if (!confirm("Delete this item?")) return;
      items.splice(idx, 1);
      saveNews(items);
      renderNewsList();
    }
  }

  function handleImageUpload() {
    const fileInput = qs("#news-image-file");
    const urlInput = qs("#news-image");
    if (!fileInput || !urlInput) return;

    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        urlInput.value = String(reader.result || "");
      };
      reader.readAsDataURL(file);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    sessionStorage.setItem(AUTH_KEY, "false");
    applyAuthUI();

    qs("#admin-login")?.addEventListener("click", login);
    qs("#admin-password")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") login();
    });
    qs("#admin-logout")?.addEventListener("click", logout);

    loadPatients();
    qs("#patients-save")?.addEventListener("click", savePatients);

    qs("#news-form")?.addEventListener("submit", upsertNews);
    qs("#news-cancel")?.addEventListener("click", resetForm);
    qs("#admin-news-list")?.addEventListener("click", handleNewsListClick);

    handleImageUpload();
    renderNewsList();
  });
})();