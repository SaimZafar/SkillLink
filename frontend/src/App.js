import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import AdminSidebar from "./components/AdminSidebar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Bids from "./pages/Bids";
import Contracts from "./pages/Contracts";
import Payments from "./pages/Payments";
import Reviews from "./pages/Reviews";
import Disputes from "./pages/Disputes";
import Notifications from "./pages/Notifications";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminBids from "./pages/admin/AdminBids";
import AdminContracts from "./pages/admin/AdminContracts";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminSkills from "./pages/admin/AdminSkills";
import AdminDisputes from "./pages/admin/AdminDisputes";
import AdminNotifications from "./pages/admin/AdminNotifications";
import "./index.css";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/landing" />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== "admin") return <Navigate to="/admin/login" />;
  return children;
}

function AdminLayout() {
  return (
    <AdminRoute>
      <div style={{ display: "flex" }}>
        <AdminSidebar />
        <div style={{
          marginLeft: "240px", padding: "40px",
          width: "calc(100% - 240px)", minHeight: "100vh",
          background: "var(--bg)",
        }}>
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="users"         element={<AdminUsers />} />
            <Route path="projects"      element={<AdminProjects />} />
            <Route path="bids"          element={<AdminBids />} />
            <Route path="contracts"     element={<AdminContracts />} />
            <Route path="payments"      element={<AdminPayments />} />
            <Route path="reviews"       element={<AdminReviews />} />
            <Route path="skills"        element={<AdminSkills />} />
            <Route path="disputes"      element={<AdminDisputes />} />
            <Route path="notifications" element={<AdminNotifications />} />
          </Routes>
        </div>
      </div>
    </AdminRoute>
  );
}

function UserLayout() {
  return (
    <PrivateRoute>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{
          marginLeft: "240px", padding: "40px",
          width: "calc(100% - 240px)", minHeight: "100vh",
          background: "var(--bg)",
        }}>
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="projects"      element={<Projects />} />
            <Route path="bids"          element={<Bids />} />
            <Route path="contracts"     element={<Contracts />} />
            <Route path="payments"      element={<Payments />} />
            <Route path="reviews"       element={<Reviews />} />
            <Route path="disputes"      element={<Disputes />} />
            <Route path="notifications" element={<Notifications />} />
          </Routes>
        </div>
      </div>
    </PrivateRoute>
  );
}

function Layout() {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route path="/landing"      element={<Landing />} />
        <Route path="/login"        element={!user ? <Login />      : <Navigate to="/dashboard" />} />
        <Route path="/register"     element={!user ? <Register />   : <Navigate to="/dashboard" />} />
        <Route path="/admin/login"  element={!user ? <AdminLogin /> : <Navigate to="/admin" />} />
        <Route path="/admin/*"      element={<AdminLayout />} />
        <Route path="/dashboard/*"  element={<UserLayout />} />
        <Route path="/"             element={<Navigate to="/landing" />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}
