import React from 'react';

const AdminProfilePage = () => {
  return (
    <div>
      <h1 className="page-title">My Admin Profile</h1>
      <div className="content-wrapper">
        <p>This page will display the logged-in admin's profile information.</p>
        <ul>
          <li>View Profile Details</li>
          <li>Change Password</li>
          <li>Manage Preferences</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminProfilePage;
