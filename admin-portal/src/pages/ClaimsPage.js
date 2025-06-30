import React from 'react';

const ClaimsPage = () => {
  return (
    <div>
      <h1 className="page-title">Claims Management</h1>
      <div className="content-wrapper">
        <p>This section will be used to manage claims.</p>
        <ul>
          <li>View All Claims</li>
          <li>View Claim Details</li>
          <li>Update Claim Status</li>
          <li>Assign Adjusters</li>
          <li>Manage Claim Documents</li>
        </ul>
      </div>
    </div>
  );
};

export default ClaimsPage;
