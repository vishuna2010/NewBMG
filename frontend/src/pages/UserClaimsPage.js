import React from 'react';

const UserClaimsPage = () => {
  return (
    <div className="page-content">
      <header className="page-header">
        <h1>My Claims</h1>
      </header>
      <p>Submit new claims, track the status of existing claims, and view your claim history.</p>
      {/* Placeholder for claims list and new claim button */}
      <div>
        <button>Submit a New Claim</button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h4>My Claim History:</h4>
        <ul>
          <li>Claim #C001 - Auto Accident (Status: Processing) <button>View Details</button></li>
        </ul>
      </div>
    </div>
  );
};

export default UserClaimsPage;
