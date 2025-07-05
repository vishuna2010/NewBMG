import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPolicies } from '../services/policyService';
import MainLayout from '../components/layout/MainLayout';

const PoliciesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllPolicies();
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

  const actions = (
    <Link 
      to="/policies/new" 
      style={{ 
        padding: '8px 16px', 
        backgroundColor: '#007bff', 
        color: 'white', 
        textDecoration: 'none', 
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <span>+</span> Create New Policy
    </Link>
  );

  if (loading) return <MainLayout pageTitle="Policies" actions={actions}><p>Loading policies...</p></MainLayout>;
  if (error && policies.length === 0) return <MainLayout pageTitle="Policies" actions={actions}><p style={{ color: 'red' }}>Error fetching policies: {error}</p></MainLayout>;

  return (
    <MainLayout pageTitle="Policies" actions={actions}>
      {policies.length === 0 ? (
        <p>No policies found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>Policy Number</th>
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
                <td style={{ padding: '8px' }}>{policy.status}</td>
                <td style={{ padding: '8px' }}>{new Date(policy.effectiveDate).toLocaleDateString()}</td>
                <td style={{ padding: '8px' }}>{new Date(policy.expiryDate).toLocaleDateString()}</td>
                <td style={{ padding: '8px' }}>
                  <Link to={`/policies/${policy._id}`} style={{ color: '#007bff' }}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </MainLayout>
  );
};

export default PoliciesPage;
