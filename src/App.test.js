import { render, screen } from "@testing-library/react";
import App from "./App";

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
