import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import './App.css';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CustomersPage from './pages/CustomersPage';
import PoliciesPage from './pages/PoliciesPage';
import ClaimsPage from './pages/ClaimsPage';
import ProductsPage from './pages/ProductsPage';
import InsurersPage from './pages/InsurersPage';
import BillingPage from './pages/BillingPage';
import ReportsPage from './pages/ReportsPage';
import CommunicationsPage from './pages/CommunicationsPage';
import UserManagementPage from './pages/UserManagementPage';
import SettingsPage from './pages/SettingsPage';
import AdminProfilePage from './pages/AdminProfilePage';
import LoginPage from './pages/LoginPage';

function App() {
  // For now, assume authenticated and redirect to dashboard
  // In a real app, you'd have auth state and protected routes
  const isAuthenticated = true; // Placeholder

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin/*"
          element={
            isAuthenticated ? (
              <MainLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="policies" element={<PoliciesPage />} />
                  <Route path="claims" element={<ClaimsPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="insurers" element={<InsurersPage />} />
                  <Route path="billing" element={<BillingPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="communications" element={<CommunicationsPage />} />
                  <Route path="users" element={<UserManagementPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="profile" element={<AdminProfilePage />} />
                  <Route index element={<Navigate to="dashboard" />} /> {/* Default admin page */}
                </Routes>
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        {/* Redirect root to admin dashboard if authenticated, else to login */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/admin/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
