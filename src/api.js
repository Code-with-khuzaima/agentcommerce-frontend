export function resolveApiBase(location = (typeof window !== "undefined" ? window.location : null), envApiBase = process.env.REACT_APP_API_URL) {
  if (envApiBase) {
    return envApiBase;
  }

  if (location) {
    const { hostname, origin } = location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:4000/api";
    }

    // Do not silently route preview or alternate domains to production.
    return `${origin}/api`;
  }

  return "http://localhost:4000/api";
}

const API_BASE = resolveApiBase();

async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || "Request failed" };
  }
}

function extractErrorMessage(data) {
  if (!data || typeof data !== "object") {
    return "";
  }

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message.trim();
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return data.error.trim();
  }

  if (data.error && typeof data.error === "object" && typeof data.error.message === "string" && data.error.message.trim()) {
    return data.error.message.trim();
  }

  if (typeof data.detail === "string" && data.detail.trim()) {
    return data.detail.trim();
  }

  return "";
}

function getAdminAuthHeaders() {
  const token = localStorage.getItem("ac_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAdminAuthHeaders(),
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    const networkError = new Error(`Network error while contacting ${API_BASE}. Check REACT_APP_API_URL or backend availability.`);
    networkError.code = "NETWORK_ERROR";
    networkError.path = path;
    networkError.apiBase = API_BASE;
    throw networkError;
  }

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const firstError = Array.isArray(data.errors) && data.errors.length ? data.errors[0] : null;
    const field = firstError?.path || firstError?.param;
    const backendMessage = extractErrorMessage(data);
    const message = firstError?.msg && firstError.msg !== "Invalid value"
      ? firstError.msg
      : field
        ? `Invalid value for ${field}`
        : (backendMessage || (res.status === 401 ? "Invalid email or password" : `Request failed (${res.status})`));

    const requestError = new Error(message);
    requestError.status = res.status;
    requestError.path = path;
    requestError.apiBase = API_BASE;
    throw requestError;
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

export function apiUpdateDashboard(body) {
  const token = localStorage.getItem("ac_token");
  return request("/client/dashboard", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

export { API_BASE, extractErrorMessage };
