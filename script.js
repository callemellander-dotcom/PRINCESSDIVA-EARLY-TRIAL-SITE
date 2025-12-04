console.log("Site loaded");

// Default patient number if nothing has been set in admin:
const DEFAULT_PATIENTS_INCLUDED = 0;
const PATIENTS_KEY = "patientsCount";

document.addEventListener("DOMContentLoaded", () => {
  const patientEl = document.getElementById("patient-number");
  if (!patientEl) return;

  const stored = localStorage.getItem(PATIENTS_KEY);
  const val = stored !== null ? stored : DEFAULT_PATIENTS_INCLUDED;
  patientEl.textContent = val;
});

// Update patient count live if changed in another tab
window.addEventListener("storage", (e) => {
  if (e.key === PATIENTS_KEY) {
    const patientEl = document.getElementById("patient-number");
    if (patientEl) patientEl.textContent = e.newValue ?? DEFAULT_PATIENTS_INCLUDED;
  }
});



// -------------------- Language switcher (EN / SV) --------------------
(function initLanguageSwitcher() {
  const STORAGE_KEY = "siteLang";
  const supported = ["en", "sv"];

  function getInitialLang() {
    const saved = (localStorage.getItem(STORAGE_KEY) || "").toLowerCase();
    if (supported.includes(saved)) return saved;
    const htmlLang = (document.documentElement.lang || "en").toLowerCase();
    return supported.includes(htmlLang) ? htmlLang : "en";
  }

  function applyLanguage(lang) {
    if (!supported.includes(lang)) lang = "en";
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    // Swap innerHTML for elements that declare both languages
    document.querySelectorAll("[data-en][data-sv]").forEach(el => {
      const val = el.getAttribute(lang === "sv" ? "data-sv" : "data-en");
      if (val != null) el.innerHTML = val;
    });

    // Swap placeholders
    document.querySelectorAll("[data-en-placeholder][data-sv-placeholder]").forEach(el => {
      const val = el.getAttribute(lang === "sv" ? "data-sv-placeholder" : "data-en-placeholder");
      if (val != null) el.setAttribute("placeholder", val);
    });

    // Highlight active flag
    document.querySelectorAll(".lang-flag-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
  }

  function ensureSwitcherExists() {
    if (document.querySelector(".lang-switcher")) return;

    const wrap = document.createElement("div");
    wrap.className = "lang-switcher";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Language switcher");
    wrap.innerHTML = `
      <button class="lang-flag-btn" data-lang="en" aria-label="Switch to English" title="English">
        <img src="assets/flag-uk.svg" alt="English"/>
      </button>
      <button class="lang-flag-btn" data-lang="sv" aria-label="Byt till svenska" title="Svenska">
        <img src="assets/flag-se.svg" alt="Svenska"/>
      </button>
    `;
    document.body.appendChild(wrap);
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureSwitcherExists();
    applyLanguage(getInitialLang());

    // Only listen on the flag buttons (won't affect banner/nav)
    document.querySelectorAll(".lang-flag-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        applyLanguage(btn.dataset.lang);
      });
    });
  });
})();
// -------------------- Language switcher binding (supports hard-added HTML) --------------------
(function wireLangButtons() {
  const STORAGE_KEY = "siteLang";
  const supported = ["en", "sv"];

  function applyLanguage(lang) {
    if (!supported.includes(lang)) lang = "en";
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    document.querySelectorAll("[data-en][data-sv]").forEach(el => {
      const val = el.getAttribute(lang === "sv" ? "data-sv" : "data-en");
      if (val != null) el.innerHTML = val;
    });

    document.querySelectorAll("[data-en-placeholder][data-sv-placeholder]").forEach(el => {
      const val = el.getAttribute(lang === "sv" ? "data-sv-placeholder" : "data-en-placeholder");
      if (val != null) el.setAttribute("placeholder", val);
    });

    document.querySelectorAll(".lang-flag-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
  }

  function getInitialLang() {
    const saved = (localStorage.getItem(STORAGE_KEY) || "").toLowerCase();
    if (supported.includes(saved)) return saved;
    const htmlLang = (document.documentElement.lang || "en").toLowerCase();
    return supported.includes(htmlLang) ? htmlLang : "en";
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyLanguage(getInitialLang());
    document.querySelectorAll(".lang-flag-btn").forEach(btn => {
      btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
    });
  });
})();



// ===== New banner dropdown controller =====
(function bannerDropdown(){
  document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector(".navbar.main-nav");
    const toggle = document.querySelector(".navbar .nav-toggle");
    const dropdowns = Array.from(document.querySelectorAll(".navbar .has-dropdown"));
    const triggers = Array.from(document.querySelectorAll(".navbar .dropdown-trigger"));

    // Mobile open/close main nav
    if (toggle && nav){
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        const isOpen = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    function closeAll(except=null){
      dropdowns.forEach(dd => {
        if (dd !== except) dd.classList.remove("open");
        const btn = dd.querySelector(".dropdown-trigger");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
    }

    triggers.forEach(btn => {
      const parent = btn.closest(".has-dropdown");
      if (!parent) return;

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const willOpen = !parent.classList.contains("open");
        closeAll(parent);
        parent.classList.toggle("open", willOpen);
        btn.setAttribute("aria-expanded", String(willOpen));
      });
    });

    document.addEventListener("click", () => closeAll());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll();
    });

    document.querySelectorAll(".navbar .dropdown-menu a, .navbar .nav-item a").forEach(a => {
      a.addEventListener("click", () => {
        closeAll();
        if (nav) nav.classList.remove("open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      });
    });
  });
})();
