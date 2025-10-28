// Main application logic
import { parseMenu, displayMenu, showOffset, getCurrentViewOffset, setMenuData, setPdfDataUrl } from './menu.js';
import { setupAdminButton } from './admin.js';
import { saveMenuData, saveStartDate, loadSavedData, clearSavedData, addViewPdfButton } from './storage.js';

// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function updateTime() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  document.getElementById("currentTime").textContent = now.toLocaleDateString(
    "en-US",
    options
  );
}

updateTime();
setInterval(updateTime, 1000);

// Update display every minute
setInterval(() => {
  import('./menu.js').then(module => {
    if (!module.manualView) displayMenu();
  });
}, 60000);

window.addEventListener("DOMContentLoaded", () => {
  setupAdminButton();
  
  document.getElementById("pdfInput").addEventListener("change", handleFileSelect);
  
  document.getElementById("startDate").addEventListener("change", () => {
    saveStartDate();
    displayMenu();
  });

  // nav buttons
  const prev = document.getElementById("prevDayBtn");
  const next = document.getElementById("nextDayBtn");
  const today = document.getElementById("todayBtn");
  
  if (prev)
    prev.addEventListener("click", () => {
      const currentOffset = getCurrentViewOffset();
      showOffset(currentOffset - 1);
    });
  if (next)
    next.addEventListener("click", () => {
      const currentOffset = getCurrentViewOffset();
      showOffset(currentOffset + 1);
    });
  if (today)
    today.addEventListener("click", () => {
      import('./menu.js').then(module => {
        module.setManualView(false);
        displayMenu();
      });
    });

  loadSavedData();
});

async function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  document.getElementById("message").innerHTML =
    '<div class="success">⏳ Reading PDF...</div>';

  try {
    // read arrayBuffer for pdf.js and dataURL for viewing
    const arrayBuffer = await file.arrayBuffer();
    const dataUrl = await fileToDataURL(file);

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    const parsedData = parseMenu(fullText);
    setMenuData(parsedData);
    setPdfDataUrl(dataUrl);
    
    saveMenuData();
    document.getElementById("message").innerHTML =
      '<div class="success">✅ PDF loaded and saved successfully!</div>';
    addViewPdfButton(dataUrl);
    displayMenu();
  } catch (error) {
    document.getElementById("message").innerHTML =
      '<div class="error">❌ Error reading PDF: ' + error.message + "</div>";
  }
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// Expose clearSavedData to global scope for onclick handler
window.clearSavedData = clearSavedData;
