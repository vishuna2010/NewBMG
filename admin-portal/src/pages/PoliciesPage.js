import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPolicies } from '../services/policyService'; // Assuming policyService.js is created

const PoliciesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllPolicies(); // Add query params if needed for filtering
      setPolicies(response.data || []);
    } catch (err) {
      setError(err.message);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  if (loading) return <p>Loading policies...</p>;
  if (error && policies.length === 0) return <p style={{ color: 'red' }}>Error fetching policies: {error}</p>;

  return (
    <div>
      <h1 className="page-title">Policy Management</h1>
      <div className="content-wrapper">
        {/* Optional: Button to trigger 'Create Policy From Quote' if admin does this,
            or this might be a process triggered elsewhere (e.g. from a quote view page) */}
        {/* <Link to="/admin/policies/create-from-quote" style={buttonStyle}>+ Create Policy from Quote</Link> */}

        {error && <p style={{ color: 'red', marginBottom: '10px' }}>Operation failed: {error}</p>}

        {policies.length === 0 && !loading ? (
          <p>No policies found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Policy #</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Customer</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Product</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Effective Date</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Expiry Date</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <tr key={policy._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{policy.policyNumber}</td>
                  <td style={{ padding: '8px' }}>
                    {policy.customer ? `${policy.customer.firstName} ${policy.customer.lastName}` : 'N/A'}
                  </td>
                  <td style={{ padding: '8px' }}>
                    {policy.product ? policy.product.name : 'N/A'}
                  </td>
                  <td style={{ padding: '8px' }}>{policy.status}</td>
                  <td style={{ padding: '8px' }}>{new Date(policy.effectiveDate).toLocaleDateString()}</td>
                  <td style={{ padding: '8px' }}>{new Date(policy.expiryDate).toLocaleDateString()}</td>
                  <td style={{ padding: '8px' }}>
                    <Link to={`/admin/policies/${policy._id}`} style={{ color: '#007bff' }}>View Details</Link>
                    {/* Edit/Manage status might be on the detail page */}
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

export default PoliciesPage;
