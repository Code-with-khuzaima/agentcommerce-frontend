import { apiLogin, extractErrorMessage, resolveApiBase } from "./api";

describe("resolveApiBase", () => {
  test("prefers REACT_APP_API_URL when provided", () => {
    expect(resolveApiBase({ hostname: "preview.example.com", origin: "https://preview.example.com" }, "https://custom.example.com/api"))
      .toBe("https://custom.example.com/api");
  });

  test("uses localhost backend for local development", () => {
    expect(resolveApiBase({ hostname: "localhost", origin: "http://localhost:3000" }, ""))
      .toBe("http://localhost:4000/api");
  });

  test("uses same-origin api path for non-local hosts when env is unset", () => {
    expect(resolveApiBase({ hostname: "preview.example.com", origin: "https://preview.example.com" }, ""))
      .toBe("https://preview.example.com/api");
  });

  test("falls back to localhost backend when no window location exists", () => {
    expect(resolveApiBase(null, "")).toBe("http://localhost:4000/api");
  });
});

describe("extractErrorMessage", () => {
  test("reads message first", () => {
    expect(extractErrorMessage({ message: "Invalid credentials" })).toBe("Invalid credentials");
  });

  test("falls back to error string", () => {
    expect(extractErrorMessage({ error: "Unauthorized" })).toBe("Unauthorized");
  });

  test("reads nested error message", () => {
    expect(extractErrorMessage({ error: { message: "Bad request" } })).toBe("Bad request");
  });

  test("reads detail when message is absent", () => {
    expect(extractErrorMessage({ detail: "Account is disabled" })).toBe("Account is disabled");
  });
});

describe("apiLogin", () => {
  afterEach(() => {
    global.fetch = undefined;
  });

  test("uses backend error field when message is absent", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ error: "Incorrect password" }),
    });

    await expect(apiLogin("demo@example.com", "bad-pass")).rejects.toThrow("Incorrect password");
  });

  test("uses login-specific fallback for bare 401 responses", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "",
    });

    await expect(apiLogin("demo@example.com", "bad-pass")).rejects.toThrow("Invalid email or password");
  });

  test("attaches status metadata for empty non-401 failures", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => "",
    });

    try {
      await apiLogin("demo@example.com", "bad-pass");
      throw new Error("Expected apiLogin to fail");
    } catch (error) {
      expect(error.message).toBe("Request failed (404)");
      expect(error.status).toBe(404);
      expect(error.path).toBe("/auth/login");
    }
  });

  test("attaches network metadata when fetch throws", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Failed to fetch"));

    try {
      await apiLogin("demo@example.com", "bad-pass");
      throw new Error("Expected apiLogin to fail");
    } catch (error) {
      expect(error.message).toContain("Network error while contacting");
      expect(error.code).toBe("NETWORK_ERROR");
      expect(error.path).toBe("/auth/login");
    }
  });
});
