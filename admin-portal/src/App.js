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
import QuoteCreatePage from './pages/QuoteCreatePage';
import ClaimDetailPage from './pages/ClaimDetailPage';
import EmailTemplatesListPage from './pages/EmailTemplatesListPage';
import EmailTemplateCreatePage from './pages/EmailTemplateCreatePage';
import EmailTemplateEditPage from './pages/EmailTemplateEditPage';
import RatingFactorsPage from './pages/RatingFactorsPage';
import RateTablesPage from './pages/RateTablesPage';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null; // Optionally show a loading spinner

  return (
    <Router basename="/admin"> {/* Added basename for admin portal */}
      <Routes>
        <Route path="/login" element={<LoginPage />} /> {/* LoginPage is outside MainLayout */}
        <Route
          path="/*" // All other routes under /admin (e.g., /admin/dashboard)
          element={
            isAuthenticated ? (
              <MainLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="policies" element={<PoliciesPage />} />
                  <Route path="policies/:id" element={<PolicyDetailPage />} />
                  <Route path="quotes" element={<QuotesListPage />} />
                  <Route path="quotes/new" element={<QuoteCreatePage />} />
                  <Route path="quotes/:id" element={<QuoteDetailPage />} />
                  <Route path="claims" element={<ClaimsPage />} />
                  <Route path="claims/:id" element={<ClaimDetailPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="products/new" element={<ProductCreatePage />} />
                  <Route path="products/edit/:id" element={<ProductEditPage />} />
                  <Route path="insurers" element={<InsurersPage />} />
                  <Route path="billing" element={<BillingPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="communications" element={<CommunicationsPage />} />
                  <Route path="users" element={<UserManagementPage />} />
                  <Route path="users/edit/:id" element={<UserEditPage />} />
                  <Route path="email-templates" element={<EmailTemplatesListPage />} />
                  <Route path="email-templates/new" element={<EmailTemplateCreatePage />} />
                  <Route path="email-templates/edit/:identifier" element={<EmailTemplateEditPage />} />
                  <Route path="rating-factors" element={<RatingFactorsPage />} />
                  <Route path="rate-tables" element={<RateTablesPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="profile" element={<AdminProfilePage />} />
                  {/* Default for /admin if authenticated */}
                  <Route index element={<Navigate to="dashboard" replace />} />
                  {/* Catch-all for /admin/* if authenticated but no match, redirect to dashboard */}
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </MainLayout>
            ) : (
              // If not authenticated, any attempt to access /admin/* (other than /admin/login explicitly)
              // should redirect to /login (which becomes /admin/login due to basename).
              // The Navigate component here will redirect if this element is rendered.
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Root path of the application (e.g. http://localhost:3002/) redirects based on auth */}
        <Route path="/" element={ <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace /> } />
      </Routes>
    </Router>
  );
}

export default App;
