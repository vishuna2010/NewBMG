import React from 'react';

const UserPoliciesPage = () => {
  return (
    <div className="page-content">
      <header className="page-header">
        <h1>My Policies</h1>
      </header>
      <p>View details of your active and past insurance policies. You can also download policy documents and request changes.</p>
      {/* Placeholder for list of policies */}
      <div>
        <h4>Active Policies:</h4>
        <ul>
          <li>Policy #12345 - Auto Insurance (Expires: 2024-12-31) <button>View Details</button></li>
          <li>Policy #67890 - Home Insurance (Expires: 2025-06-30) <button>View Details</button></li>
        </ul>
      </div>
    </div>
  );
};

export default UserPoliciesPage;
