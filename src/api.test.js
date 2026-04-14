import { resolveApiBase } from "./api";

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
