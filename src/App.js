import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HrDashboard from "./pages/dashboard/HrDashboard";
import OfficerDashboard from "./pages/dashboard/OfficerDashboard";
import ApproverDashboard from "./pages/dashboard/ApproverDashboard";
import ManagerDashboard from "./pages/dashboard/ManagerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import "./components/css/styles.css";

//PrivateRoute wrapper
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/manager-dashboard"
          element={
            <PrivateRoute>
              <ManagerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/hr-dashboard"
          element={
            <PrivateRoute>
              <HrDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/officer-dashboard"
          element={
            <PrivateRoute>
              <OfficerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/approver-dashboard"
          element={
            <PrivateRoute>
              <ApproverDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
