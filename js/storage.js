// Storage and persistence logic - now using server API
import { setMenuData, setPdfDataUrl, displayMenu } from './menu.js';

const API_BASE = window.location.origin.includes('localhost') 
  ? 'http://localhost:3000/api' 
  : '/api';

export async function saveMenuData(menuData, startDate, pdfDataUrl) {
  try {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      throw new Error('Admin authentication required');
    }

    const response = await fetch(`${API_BASE}/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        menuData,
        startDate,
        pdfDataUrl: pdfDataUrl || null
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      updateSavedStatus(true, new Date(result.savedAt));
      if (pdfDataUrl) addViewPdfButton(pdfDataUrl);
      return true;
    } else {
      throw new Error(result.message || 'Failed to save menu');
    }
  } catch (error) {
    console.error("Error saving data:", error);
    document.getElementById("message").innerHTML = 
      `<div class="error">❌ Error saving menu: ${error.message}</div>`;
    return false;
  }
}

export async function saveStartDate(startDate) {
  try {
    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      throw new Error('Admin authentication required');
    }

    // Get existing menu data first
    const existingData = await loadSavedData(false);
    if (!existingData) {
      // No existing menu, just update UI
      document.getElementById("startDate").value = startDate;
      return;
    }

    // Save with updated start date
    const response = await fetch(`${API_BASE}/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        menuData: existingData.menuData,
        startDate: startDate,
        pdfDataUrl: existingData.pdfDataUrl
      })
    });

    const result = await response.json();
    if (response.ok && result.success) {
      updateSavedStatus(true, new Date(result.savedAt));
    }
  } catch (error) {
    console.error("Error saving start date:", error);
  }
}

export async function loadSavedData(updateUI = true) {
  try {
    const response = await fetch(`${API_BASE}/menu`);
    const result = await response.json();

    if (!response.ok || !result.success || !result.data) {
      if (updateUI) {
        document.getElementById("message").innerHTML = 
          '<div class="error">⚠️ Menu not set. Please ask an admin to upload the PDF.</div>';
      }
      return null;
    }

    const savedData = result.data;
    
    if (updateUI) {
      if (savedData.menuData) setMenuData(savedData.menuData);
      if (savedData.startDate) {
        document.getElementById("startDate").value = savedData.startDate;
      }
      if (savedData.pdfDataUrl) {
        setPdfDataUrl(savedData.pdfDataUrl);
        addViewPdfButton(savedData.pdfDataUrl);
      }
      if (savedData.savedAt) {
        updateSavedStatus(true, new Date(savedData.savedAt));
      }
      displayMenu();
    }
    
    return savedData;
  } catch (error) {
    console.error("Error loading menu data:", error);
    if (updateUI) {
      document.getElementById("message").innerHTML = 
        '<div class="error">❌ Error loading menu. Please check your connection.</div>';
    }
    return null;
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

export async function clearSavedData() {
  if (confirm("Are you sure you want to clear the saved menu data?")) {
    try {
      const token = sessionStorage.getItem('adminToken');
      if (!token) {
        alert('Admin authentication required');
        return;
      }

      const response = await fetch(`${API_BASE}/menu`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setMenuData(null);
        setPdfDataUrl(null);
        removeViewPdfButton();
        document.getElementById("menuDisplay").style.display = "none";
        document.getElementById("message").innerHTML =
          '<div class="success">✅ Saved data cleared!</div>';
        updateSavedStatus(false);
      } else {
        throw new Error(result.message || 'Failed to clear data');
      }
    } catch (error) {
      console.error("Error clearing data:", error);
      document.getElementById("message").innerHTML =
        `<div class="error">❌ Error clearing data: ${error.message}</div>`;
    }
  }
}
