const API_BASE = process.env.REACT_APP_API_URL || (window.location.hostname === "localhost" ? "http://localhost:4000/api" : "https://agentcomerce-backend.up.railway.app/api");

async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "Request failed" };
  }
}

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

export { API_BASE };


// ── AUTH API CALLS ────────────────────────────────────────────
export function apiLogin(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function apiGetDashboard() {
  const token = localStorage.getItem("ac_token");
  return request("/client/dashboard", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}
