import React from 'react';
import { Link } from 'react-router-dom';

const AdminHeader = () => {
  return (
    <header className="admin-header">
      <div>
        {/* Breadcrumbs or current page title could go here */}
        <h4>Page Title / Section</h4>
      </div>
      <div>
        {/* User profile, notifications, logout */}
        <Link to="/admin/profile">User Profile</Link> | <Link to="/logout">Logout</Link>
      </div>
    </header>
  );
};

export default AdminHeader;
