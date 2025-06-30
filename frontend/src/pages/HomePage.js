import React from 'react';

const HomePage = () => {
  return (
    <div className="page-content">
      <header className="page-header">
        <h1>Welcome to the Insurance Broker Portal</h1>
      </header>
      <p>
        This is the main customer portal. From here, you will be able to manage your policies,
        file claims, get new quotes, and much more.
      </p>
      <section>
        <h2>Quick Links</h2>
        <ul>
          <li>View My Policies (Coming Soon)</li>
          <li>File a New Claim (Coming Soon)</li>
          <li>Get a Quote (Coming Soon)</li>
          <li>My Profile (Coming Soon)</li>
        </ul>
      </section>
      <section>
        <h2>Announcements</h2>
        <p>No new announcements at this time.</p>
      </section>
    </div>
  );
};

export default HomePage;
