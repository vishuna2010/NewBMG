import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import './App.css';
import AdminDashboardPage from './pages/AdminDashboardPage';
// import CustomersPage from './pages/CustomersPage'; // Removed as it's merged into UserManagementPage
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
import ProductCreatePage from './pages/ProductCreatePage';
import ProductEditPage from './pages/ProductEditPage';
import UserEditPage from './pages/UserEditPage';
import PolicyDetailPage from './pages/PolicyDetailPage';
import QuotesListPage from './pages/QuotesListPage';
import QuoteDetailPage from './pages/QuoteDetailPage';
import ClaimDetailPage from './pages/ClaimDetailPage'; // Added ClaimDetailPage import

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
                  {/* <Route path="customers" element={<CustomersPage />} />  // Removed, merged into /users */}
                  <Route path="policies" element={<PoliciesPage />} />
                  <Route path="policies/:id" element={<PolicyDetailPage />} /> {/* Added route for policy details */}
                  <Route path="quotes" element={<QuotesListPage />} /> {/* Added route for quotes list */}
                  <Route path="quotes/:id" element={<QuoteDetailPage />} /> {/* Added route for quote details */}
                  <Route path="claims" element={<ClaimsPage />} /> {/* This is the Claims List Page */}
                  <Route path="claims/:id" element={<ClaimDetailPage />} /> {/* Added route for claim details */}
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="products/new" element={<ProductCreatePage />} />
                  <Route path="products/edit/:id" element={<ProductEditPage />} />
                  <Route path="insurers" element={<InsurersPage />} />
                  <Route path="billing" element={<BillingPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="communications" element={<CommunicationsPage />} />
                  <Route path="users" element={<UserManagementPage />} />
                  <Route path="users/edit/:id" element={<UserEditPage />} /> {/* Added route for editing a user */}
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
