import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllClaims } from '../services/claimService'; // Assuming claimService.js is created

const ClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: '', policyId: '', customerId: '' }); // Example filters

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      // Create a clean object with only active filters
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
      }, {});
      const response = await getAllClaims(activeFilters);
      setClaims(response.data || []);
    } catch (err) {
      setError(err.message);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [filters]); // Refetch when filters change

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  // const handleFilterSubmit = (e) => {
  //   e.preventDefault();
  //   // fetchClaims(); // Not needed here as useEffect handles it based on filters state change
  // };

  const clearFilters = () => {
    setFilters({ status: '', policyId: '', customerId: '' });
  };


  if (loading) return <p>Loading claims...</p>;
  // Show error prominently if claims list is empty due to it
  if (error && claims.length === 0) return (
    <div>
        <h1 className="page-title">Claims Management</h1>
        <div className="content-wrapper">
            <p style={{ color: 'red' }}>Error fetching claims: {error}</p>
        </div>
    </div>
  );

  // Basic styling for filter inputs
  const filterInputStyle = { marginRight: '10px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' };
  const filterButtonStyle = { padding: '8px 12px', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: 'white', cursor: 'pointer', marginRight: '5px' };


  return (
    <div>
      <h1 className="page-title">Claims Management</h1>
      <div className="content-wrapper">
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
          <h4>Filter Claims</h4>
          <input
            type="text"
            name="status"
            placeholder="Status (e.g., Open)"
            value={filters.status}
            onChange={handleFilterChange}
            style={filterInputStyle}
          />
          <input
            type="text"
            name="policyId"
            placeholder="Policy ID"
            value={filters.policyId}
            onChange={handleFilterChange}
            style={filterInputStyle}
          />
          <input
            type="text"
            name="customerId"
            placeholder="Customer ID"
            value={filters.customerId}
            onChange={handleFilterChange}
            style={filterInputStyle}
          />
          {/* The button is not strictly necessary if useEffect refetches on filter change */}
          {/* <button type="button" onClick={fetchClaims} style={filterButtonStyle}>Apply Filters</button> */}
          <button type="button" onClick={clearFilters} style={{...filterButtonStyle, backgroundColor: '#6c757d' }}>Clear Filters</button>
        </div>

        {error && <p style={{ color: 'red', marginBottom: '10px' }}>Error during operation: {error}</p>}

        {claims.length === 0 && !loading ? (
          <p>No claims found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Claim #</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Policy #</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Customer</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Date of Loss</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Reported Date</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Adjuster</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{claim.claimNumber}</td>
                  <td style={{ padding: '8px' }}>{claim.policy?.policyNumber || 'N/A'}</td>
                  <td style={{ padding: '8px' }}>
                    {claim.customer ? `${claim.customer.firstName} ${claim.customer.lastName}` : 'N/A'}
                  </td>
                  <td style={{ padding: '8px' }}>{new Date(claim.dateOfLoss).toLocaleDateString()}</td>
                  <td style={{ padding: '8px' }}>{new Date(claim.reportedDate).toLocaleDateString()}</td>
                  <td style={{ padding: '8px' }}>{claim.status}</td>
                  <td style={{ padding: '8px' }}>
                    {claim.adjuster ? `${claim.adjuster.firstName} ${claim.adjuster.lastName}` : 'Unassigned'}
                  </td>
                  <td style={{ padding: '8px' }}>
                    <Link to={`/admin/claims/${claim._id}`} style={{ color: '#007bff' }}>View Details</Link>
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

export default ClaimsPage;
