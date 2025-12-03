console.log("Site loaded");

// Default patient number if nothing has been set in admin:
const DEFAULT_PATIENTS_INCLUDED = 0;
const PATIENTS_KEY = "princess_diva_patients_included";

document.addEventListener("DOMContentLoaded", () => {
  const patientEl = document.getElementById("patient-number");
  if (!patientEl) return;

  const stored = localStorage.getItem(PATIENTS_KEY);
  const val = stored !== null ? stored : DEFAULT_PATIENTS_INCLUDED;
  patientEl.textContent = val;
});
