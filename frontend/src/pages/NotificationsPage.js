import React from 'react';

const NotificationsPage = () => {
  return (
    <div className="page-content">
      <header className="page-header">
        <h1>Notifications</h1>
      </header>
      <p>View important updates and notifications regarding your account, policies, and claims.</p>
      {/* Placeholder for notifications list */}
      <div>
        <h4>Recent Notifications:</h4>
        <ul>
          <li>Your claim #C001 has been updated. (2 hours ago) <button>View</button></li>
          <li>Upcoming payment due for Policy #12345. (1 day ago) <button>View</button></li>
          <li>Welcome to InsuranceCo! (5 days ago)</li>
        </ul>
        <button>Mark all as read</button>
      </div>
    </div>
  );
};

export default NotificationsPage;
