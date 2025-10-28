// Storage and persistence logic
import { STORAGE_KEY, menuData, pdfDataUrl, setMenuData, setPdfDataUrl, displayMenu } from './menu.js';

export function saveMenuData() {
  try {
    const dataToSave = {
      menuData: menuData,
      startDate: document.getElementById("startDate").value,
      savedAt: new Date().toISOString(),
      pdfDataUrl: pdfDataUrl || null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    updateSavedStatus(true, new Date());
    if (pdfDataUrl) addViewPdfButton(pdfDataUrl);
  } catch (e) {
    console.error("Error saving data:", e);
  }
}

export function saveStartDate() {
  // allow saving start date even if menu hasn't been uploaded yet
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    existing.startDate = document.getElementById("startDate").value;
    existing.savedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    updateSavedStatus(true, new Date());
  } catch (e) {
    console.error(e);
  }
}

export function loadSavedData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      document.getElementById("message").innerHTML =
        '<div class="error">⚠️ Menu not set. Please ask an admin to upload the PDF.</div>';
      return;
    }
    const savedData = JSON.parse(raw);
    if (savedData.menuData) setMenuData(savedData.menuData);
    if (savedData.startDate)
      document.getElementById("startDate").value = savedData.startDate;
    if (savedData.pdfDataUrl) {
      setPdfDataUrl(savedData.pdfDataUrl);
      addViewPdfButton(savedData.pdfDataUrl);
    }
    if (savedData.savedAt)
      updateSavedStatus(true, new Date(savedData.savedAt));
    displayMenu();
  } catch (e) {
    console.log("No saved data found or error loading:", e);
  }
}

export function updateSavedStatus(saved, date) {
  const statusDiv = document.getElementById("savedStatus");
  if (saved && date) {
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    statusDiv.innerHTML = `<div class="saved-info" style="margin-top: 15px;">✅ Menu saved! Last updated: ${dateStr}</div>`;
  } else if (saved) {
    statusDiv.innerHTML = `<div class="saved-info" style="margin-top: 15px;">✅ Menu saved successfully!</div>`;
  } else {
    statusDiv.innerHTML = "";
  }
}

export function addViewPdfButton(dataUrl) {
  const statusDiv = document.getElementById("savedStatus");
  const existing = document.getElementById("viewPdfBtn");
  if (existing) return;
  const btn = document.createElement("div");
  btn.style.marginTop = "12px";
  btn.innerHTML = `<a id="viewPdfBtn" href="${dataUrl}" target="_blank" style="display:inline-block;padding:8px 12px;background:#667eea;color:#fff;border-radius:8px;text-decoration:none;">📄 View original PDF</a> <a href="${dataUrl}" download="mess_menu.pdf" style="display:inline-block;margin-left:8px;padding:8px 12px;background:#764ba2;color:#fff;border-radius:8px;text-decoration:none;">⬇️ Download</a>`;
  statusDiv.appendChild(btn);
}

export function removeViewPdfButton() {
  const btn = document.getElementById("viewPdfBtn");
  if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
}

export function clearSavedData() {
  if (confirm("Are you sure you want to clear the saved menu data?")) {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setMenuData(null);
      setPdfDataUrl(null);
      removeViewPdfButton();
      document.getElementById("menuDisplay").style.display = "none";
      document.getElementById("message").innerHTML =
        '<div class="success">✅ Saved data cleared!</div>';
      updateSavedStatus(false);
    } catch (e) {
      document.getElementById("message").innerHTML =
        '<div class="error">❌ Error clearing data</div>';
    }
  }
}
