import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllQuotes } from '../services/quoteService';

const QuotesListPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllQuotes();
      setQuotes(response.data || []);
    } catch (err) {
      setError(err.message);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  if (loading) return <p>Loading quotes...</p>;
  if (error && quotes.length === 0) return <p style={{ color: 'red' }}>Error fetching quotes: {error}</p>;

  return (
    <div>
      <h1 className="page-title">Quote Management</h1>
      <div className="content-wrapper">
        {/* Optional: Button to create a new quote if admin has this functionality directly */}
        {/* <Link to="/admin/quotes/new" style={buttonStyle}>+ Create New Quote</Link> */}

        {error && <p style={{ color: 'red', marginBottom: '10px' }}>Operation failed: {error}</p>}

        {quotes.length === 0 && !loading ? (
          <p>No quotes found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Quote #</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Customer</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Product</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Premium</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Valid Until</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{quote.quoteNumber}</td>
                  <td style={{ padding: '8px' }}>
                    {quote.customer ? `${quote.customer.firstName} ${quote.customer.lastName}` : 'N/A'}
                  </td>
                  <td style={{ padding: '8px' }}>
                    {quote.product ? quote.product.name :
                     (quote.productDetailsSnapshot ? quote.productDetailsSnapshot.name : 'N/A')}
                  </td>
                  <td style={{ padding: '8px' }}>
                    {quote.calculatedPremium} {quote.productDetailsSnapshot?.currency}
                  </td>
                  <td style={{ padding: '8px' }}>{quote.status}</td>
                  <td style={{ padding: '8px' }}>
                    {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '8px' }}>
                    <Link to={`/admin/quotes/${quote._id}`} style={{ color: '#007bff' }}>View Details</Link>
                    {/* Further actions like edit status might be on the detail page */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// const buttonStyle = {
//   marginBottom: '20px', display: 'inline-block', padding: '10px 15px',
//   backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px'
// };

export default QuotesListPage;
