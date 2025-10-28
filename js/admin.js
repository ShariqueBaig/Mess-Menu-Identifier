// Admin authentication logic - now uses backend API
const API_BASE = window.location.origin.includes('localhost') 
  ? 'http://localhost:3000/api' 
  : '/api';

export function setupAdminButton() {
  const adminBtn = document.getElementById("adminBtn");
  adminBtn.addEventListener("click", promptAdmin);
}

export async function promptAdmin() {
  const entered = prompt("Enter admin password to manage menu:");
  if (entered === null) return; // cancelled
  
  try {
    const response = await fetch(`${API_BASE}/admin/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: entered })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Store token for future admin operations
      sessionStorage.setItem('adminToken', data.token);
      unlockAdmin();
    } else {
      alert(data.message || "Incorrect password");
    }
  } catch (error) {
    console.error('Auth error:', error);
    alert("Authentication failed. Please check if the server is running.");
  }
}

export function unlockAdmin() {
  const uploadSection = document.getElementById("uploadSection");
  if (uploadSection) uploadSection.style.display = "block";
  const startSection = document.getElementById("startDateSection");
  if (startSection) startSection.style.display = "block";
  const startInput = document.getElementById("startDate");
  if (startInput) startInput.disabled = false;
  alert("Admin unlocked. You can now upload a new PDF and set the start date.");
}

export function isAdminLoggedIn() {
  return sessionStorage.getItem('adminToken') !== null;
}

export function getAdminToken() {
  return sessionStorage.getItem('adminToken');
}

export function logoutAdmin() {
  sessionStorage.removeItem('adminToken');
  const uploadSection = document.getElementById("uploadSection");
  if (uploadSection) uploadSection.style.display = "none";
  const startSection = document.getElementById("startDateSection");
  if (startSection) startSection.style.display = "none";
}
