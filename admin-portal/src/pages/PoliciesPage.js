import React from 'react';

const PoliciesPage = () => {
  return (
    <div>
      <h1 className="page-title">Policy Management</h1>
      <div className="content-wrapper">
        <p>This section will be used to manage insurance policies.</p>
        <ul>
          <li>View All Policies</li>
          <li>Search/Filter Policies</li>
          <li>View Policy Details</li>
          <li>Issue New Policy (from quote)</li>
          <li>Manage Endorsements</li>
        </ul>
      </div>
    </div>
  );
};

export default PoliciesPage;
