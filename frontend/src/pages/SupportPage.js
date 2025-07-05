import React from 'react';

const SupportPage = () => {
  return (
    <div className="page-content">
      <header className="page-header">
        <h1>Support</h1>
      </header>
      <p>Find answers to frequently asked questions or contact our support team.</p>
      {/* Placeholder for support options */}
      <div>
        <h4>Frequently Asked Questions (FAQ)</h4>
        <ul>
          <li>How do I file a claim?</li>
          <li>How can I update my policy details?</li>
        </ul>
        <h4>Contact Us</h4>
        <p>Email: support@insuranceco.example</p>
        <p>Phone: 1-800-555-1234</p>
        <button>Send a Secure Message</button>
      </div>
    </div>
  );
};

export default SupportPage;
