import React from 'react';

const UserManagementPage = () => {
  return (
    <div>
      <h1 className="page-title">User Management (Staff/Brokers)</h1>
      <div className="content-wrapper">
        <p>This section will be used to manage admin users, staff, and broker accounts.</p>
        <ul>
          <li>View User List</li>
          <li>Create New User</li>
          <li>Edit User Roles & Permissions</li>
          <li>Deactivate/Activate Users</li>
        </ul>
      </div>
    </div>
  );
};

export default UserManagementPage;
