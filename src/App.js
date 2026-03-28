import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import AdminLoginPage from "./AdminLoginPage";

function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: "40px", marginBottom: "10px" }}>
        Agent Commerce
      </h1>

      <p style={{ marginBottom: "30px", color: "#cbd5f5" }}>
        AI Powered Store Dashboard
      </p>

      <div>
        <button
          type="button"
          style={{
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            background: "#7c3aed",
            color: "white",
            cursor: "pointer",
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

function AdminRoute({ children }) {
  const token = localStorage.getItem("ac_admin_token");
  return token ? children : <Navigate to="/admin" replace />;
}

function AdminEntryRoute() {
  const token = localStorage.getItem("ac_admin_token");
  return token ? <Navigate to="/admin/dashboard" replace /> : <AdminLoginPage />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/admin" element={<AdminEntryRoute />} />
        <Route
          path="/admin/dashboard"
          element={(
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          )}
        />
      </Routes>
    </Router>
  );
}
