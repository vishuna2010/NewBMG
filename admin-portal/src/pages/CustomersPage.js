import React from 'react';

const CustomersPage = () => {
  return (
    <div>
      <h1 className="page-title">Customer Management</h1>
      <div className="content-wrapper">
        <p>This section will be used to manage customers (clients).</p>
        <ul>
          <li>View Customer List</li>
          <li>Add New Customer</li>
          <li>Edit Customer Details</li>
          <li>View Customer Policy History</li>
        </ul>
      </div>
    </div>
  );
};

export default CustomersPage;
