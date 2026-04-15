import { render, screen } from "@testing-library/react";
import App, { normalizeStoreUrl } from "./App";

jest.mock("./AdminDashboard", () => () => <div>Admin Dashboard Mock</div>);
jest.mock("./AdminLoginPage", () => () => <div>Admin Login Mock</div>);
jest.mock("./ClientDashboard", () => () => <div>Client Dashboard Mock</div>);
jest.mock("./LoginPage", () => () => <div>Client Login Mock</div>);
jest.mock("./SalesPopup", () => () => null);

function renderAt(path, options = {}) {
  window.history.pushState({}, "", path);
  localStorage.clear();

  if (options.clientToken) {
    localStorage.setItem("ac_token", options.clientToken);
  }

  if (options.clientUser) {
    localStorage.setItem("ac_user", JSON.stringify(options.clientUser));
  }

  if (options.adminToken) {
    localStorage.setItem("ac_admin_token", options.adminToken);
  }

  return render(<App />);
}

describe("App routing shell", () => {
  afterEach(() => {
    localStorage.clear();
    window.history.pushState({}, "", "/");
  });

  test("renders the client login route", () => {
    renderAt("/login");
    expect(screen.getByText("Client Login Mock")).toBeInTheDocument();
  });

  test("renders the admin login route", () => {
    renderAt("/admin");
    expect(screen.getByText("Admin Login Mock")).toBeInTheDocument();
  });

  test("renders the client dashboard when session data exists", () => {
    renderAt("/dashboard", {
      clientToken: "token_123",
      clientUser: { email: "owner@example.com" },
    });
    expect(screen.getByText("Client Dashboard Mock")).toBeInTheDocument();
  });

  test("renders the admin dashboard when admin token exists", () => {
    renderAt("/admin/dashboard", {
      adminToken: "admin_token_123",
    });
    expect(screen.getByText("Admin Dashboard Mock")).toBeInTheDocument();
  });
});

describe("normalizeStoreUrl", () => {
  test("normalizes Shopify admin URLs to the canonical shop domain", () => {
    expect(normalizeStoreUrl("https://Example-Store.myshopify.com/admin/settings", "shopify")).toBe("https://example-store.myshopify.com");
  });

  test("adds https when the user enters only the hostname", () => {
    expect(normalizeStoreUrl("example-store.myshopify.com", "shopify")).toBe("https://example-store.myshopify.com");
  });

  test("keeps WooCommerce subdirectory installs while stripping wp-admin", () => {
    expect(normalizeStoreUrl("https://example.com/shop/wp-admin/admin.php?page=wc-settings", "woocommerce")).toBe("https://example.com/shop");
  });

  test("strips WooCommerce API endpoints down to the site base", () => {
    expect(normalizeStoreUrl("https://example.com/store/wp-json/wc/v3/products", "woocommerce")).toBe("https://example.com/store");
  });
});
