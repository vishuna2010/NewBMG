import React from 'react';

const QuotesPage = () => {
  return (
    <div className="page-content">
      <header className="page-header">
        <h1>Get Insurance / Quotes</h1>
      </header>
      <p>Browse available insurance products and get personalized quotes.</p>
      {/* Placeholder for quote form or product selection */}
      <div>
        <button>Get Auto Insurance Quote</button>
        <button style={{ marginLeft: '10px' }}>Get Home Insurance Quote</button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h4>My Saved Quotes:</h4>
        <p>(No saved quotes yet)</p>
      </div>
    </div>
  );
};

export default QuotesPage;
