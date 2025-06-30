import React from 'react';

const AdminDashboardPage = () => {
  return (
    <div>
      <h1 className="page-title">Admin Dashboard</h1>
      <div className="content-wrapper">
        <p>Welcome to the admin dashboard. Key metrics and summaries will be displayed here.</p>
        {/* Placeholder content for dashboard items */}
        <p>Total Policies: 1200</p>
        <p>Open Claims: 35</p>
        <p>New Quotes This Month: 78</p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
