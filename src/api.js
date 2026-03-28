// api.js
// Handles all API requests for Agent Commerce frontend

const API_BASE = process.env.REACT_APP_API_URL || 
  (window.location.hostname === "localhost" 
    ? "http://localhost:4000/api" 
    : "https://agentcommerce-backend-production.up.railway.app/api"); // <- deployed backend

// Safely parse JSON response
async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "Request failed" };
  }
}

// Generic request function
async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// HTTP helper functions
export function apiGet(path) {
  return request(path, { method: "GET" });
}

export function apiPost(path, body) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function apiPatch(path, body) {
  return request(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// Export API base for reference
export { API_BASE };

// ── AUTH API CALLS ────────────────────────────────────────────

// Login user
export function apiLogin(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// Get dashboard data
export function apiGetDashboard() {
  const token = localStorage.getItem("ac_token");
  return request("/client/dashboard", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}