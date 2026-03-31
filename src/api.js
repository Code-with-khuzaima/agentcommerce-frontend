const API_BASE = process.env.REACT_APP_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:4000/api"
    : "https://agentcommerce-backend-production.up.railway.app/api");

async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "Request failed" };
  }
}

function getAdminAuthHeaders() {
  const token = localStorage.getItem("ac_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAdminAuthHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const firstError = Array.isArray(data.errors) && data.errors.length ? data.errors[0] : null;
    const field = firstError?.path || firstError?.param;
    const message = firstError?.msg && firstError.msg !== "Invalid value"
      ? firstError.msg
      : field
        ? `Invalid value for ${field}`
        : (data.message || "Request failed");

    throw new Error(message);
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

export function apiLogin(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function apiForgotPassword(email) {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function apiAdminLogin(password) {
  const data = await request("/admin/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });

  if (data.token) {
    localStorage.setItem("ac_admin_token", data.token);
  }

  return data;
}

export function clearAdminSession() {
  localStorage.removeItem("ac_admin_token");
}

export function apiGetDashboard() {
  const token = localStorage.getItem("ac_token");
  return request("/client/dashboard", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export { API_BASE };
