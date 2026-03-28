import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import AdminLoginPage from "./AdminLoginPage";
import ClientDashboard from "./ClientDashboard";
import LoginPage from "./LoginPage";

// Simple Landing Page
function LandingPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial"
    }}>
      <h1 style={{ fontSize: "40px", marginBottom: "10px" }}>
        🚀 Agent Commerce
      </h1>

      <p style={{ marginBottom: "30px", color: "#cbd5f5" }}>
        AI Powered Store Dashboard
      </p>

      <div style={{ display: "flex", gap: "20px" }}>
        <a href="/login">
          <button style={{
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            background: "#7c3aed",
            color: "white",
            cursor: "pointer"
          }}>
            Client Login
          </button>
        </a>

        <a href="/admin">
          <button style={{
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            background: "#10b981",
            color: "white",
            cursor: "pointer"
          }}>
            Admin Login
          </button>
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>

        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Client */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ClientDashboard />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

      </Routes>
    </Router>
  );
}