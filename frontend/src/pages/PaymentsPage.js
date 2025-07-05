import React from 'react';

const PaymentsPage = () => {
  return (
    <div className="page-content">
      <header className="page-header">
        <h1>Payments</h1>
      </header>
      <p>View outstanding payments, make secure online payments, and review your payment history.</p>
      {/* Placeholder for payment information */}
      <div>
        <h4>Outstanding Payments:</h4>
        <p>Policy #12345 - Premium Due: $150.00 <button>Pay Now</button></p>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h4>Payment History:</h4>
        <ul>
          <li>01/01/2023 - Payment Received - $150.00 for Policy #12345</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentsPage;
