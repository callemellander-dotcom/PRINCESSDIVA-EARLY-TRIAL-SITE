const ADMIN_PASS = "princessdiva"; // change this
const PATIENTS_KEY = "princess_diva_patients_included";

function isLoggedIn() {
  return sessionStorage.getItem("pd_admin") === "1";
}
function setLoggedIn(v) {
  sessionStorage.setItem("pd_admin", v ? "1" : "0");
}

function showDashboard() {
  document.getElementById("login-box").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  // preload patients count
  const current = localStorage.getItem(PATIENTS_KEY) ?? "";
  document.getElementById("patients-count").value = current;
  renderAdminList();
}
function showLogin() {
  document.getElementById("login-box").style.display = "block";
  document.getElementById("dashboard").style.display = "none";
}

function renderAdminList() {
  const list = document.getElementById("admin-news-list");
  const items = getNews().slice().sort((a,b)=> (b.date||"").localeCompare(a.date||""));
  list.innerHTML = "";

  if (items.length === 0) {
    list.innerHTML = "<p class='muted'>No items yet.</p>";
    return;
  }

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "news-item";
    div.innerHTML = `
      <h3>${item.title}</h3>
      <div class="muted">${item.date}</div>
      <p>${item.body}</p>
      <div style="display:flex; gap:.5rem; margin-top:.5rem;">
        <button class="button button-outline" data-edit="${item.id}">Edit</button>
        <button class="button button-outline" data-del="${item.id}">Delete</button>
      </div>
    `;
    list.appendChild(div);
  });

  list.querySelectorAll("[data-edit]").forEach(btn=>{
    btn.addEventListener("click", ()=> startEdit(btn.dataset.edit));
  });
  list.querySelectorAll("[data-del]").forEach(btn=>{
    btn.addEventListener("click", ()=> deleteItem(btn.dataset.del));
  });
}

function startEdit(id) {
  const items = getNews();
  const item = items.find(x=>x.id===id);
  if (!item) return;

  document.getElementById("news-id").value = item.id;
  document.getElementById("news-title").value = item.title;
  document.getElementById("news-date").value = item.date;
  document.getElementById("news-body").value = item.body;
  document.getElementById("news-cancel").style.display = "inline-block";
}

function clearForm() {
  document.getElementById("news-id").value = "";
  document.getElementById("news-title").value = "";
  document.getElementById("news-date").value = "";
  document.getElementById("news-body").value = "";
  document.getElementById("news-cancel").style.display = "none";
}

function deleteItem(id) {
  const items = getNews().filter(x=>x.id!==id);
  saveNews(items);
  renderAdminList();
  renderNews();
}

document.addEventListener("DOMContentLoaded", ()=>{
  const loginBtn = document.getElementById("admin-login");
  const logoutBtn = document.getElementById("admin-logout");
  const form = document.getElementById("news-form");
  const cancelBtn = document.getElementById("news-cancel");
  const savePatientsBtn = document.getElementById("patients-save");

  loginBtn.addEventListener("click", ()=>{
    const pass = document.getElementById("admin-password").value;
    if (pass === ADMIN_PASS) {
      setLoggedIn(true);
      showDashboard();
    } else {
      alert("Wrong password");
    }
  });

  logoutBtn.addEventListener("click", ()=>{
    setLoggedIn(false);
    showLogin();
  });

  cancelBtn.addEventListener("click", clearForm);

  savePatientsBtn.addEventListener("click", ()=>{
    const val = document.getElementById("patients-count").value;
    if (val === "" || Number(val) < 0) {
      alert("Please enter a non-negative number.");
      return;
    }
    localStorage.setItem(PATIENTS_KEY, String(Number(val)));
    alert("Patient count saved.");
    // update banner number if visible
    const patientEl = document.getElementById("patient-number");
    if (patientEl) patientEl.textContent = String(Number(val));
  });

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const id = document.getElementById("news-id").value || crypto.randomUUID();
    const title = document.getElementById("news-title").value.trim();
    const date = document.getElementById("news-date").value;
    const body = document.getElementById("news-body").value.trim();

    const items = getNews();
    const idx = items.findIndex(x=>x.id===id);
    const item = {id, title, date, body};

    if (idx>=0) items[idx] = item; else items.push(item);
    saveNews(items);
    clearForm();
    renderAdminList();
    renderNews();
  });

  if (isLoggedIn()) showDashboard(); else showLogin();
});
