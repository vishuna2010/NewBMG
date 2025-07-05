import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import UserPoliciesPage from './pages/UserPoliciesPage';
import QuotesPage from './pages/QuotesPage';
import UserClaimsPage from './pages/UserClaimsPage';
import PaymentsPage from './pages/PaymentsPage';
import DocumentsPage from './pages/DocumentsPage';
import SupportPage from './pages/SupportPage';
import NotificationsPage from './pages/NotificationsPage';
import Header from './components/common/Header';
import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <div className="container">
        <Routes>
          <Route path="/" element={<HomePage />} /> {/* Dashboard */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/policies" element={<UserPoliciesPage />} />
          <Route path="/get-quote" element={<QuotesPage />} />
          <Route path="/claims" element={<UserClaimsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          {/* Add other routes here as pages are created */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
