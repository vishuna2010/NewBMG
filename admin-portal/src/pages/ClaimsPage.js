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
  //   fetchClaims(); // Already handled by useEffect on filters change
  // };


  if (loading) return <p>Loading claims...</p>;
  if (error && claims.length === 0) return <p style={{ color: 'red' }}>Error fetching claims: {error}</p>;

  return (
    <div>
      <h1 className="page-title">Claims Management</h1>
      <div className="content-wrapper">
        {/* TODO: Add Filter UI controls that update the 'filters' state */}
        {/* <form onSubmit={handleFilterSubmit} style={{ marginBottom: '20px' }}>
          <input type="text" name="status" placeholder="Filter by Status" value={filters.status} onChange={handleFilterChange} />
          <input type="text" name="policyId" placeholder="Filter by Policy ID" value={filters.policyId} onChange={handleFilterChange} />
          <button type="submit">Filter</button>
        </form> */}
        <p style={{fontStyle: 'italic', marginBottom: '20px'}}>Basic filtering via query params is supported by the backend. UI for filters can be added here.</p>


        {error && <p style={{ color: 'red', marginBottom: '10px' }}>Operation failed: {error}</p>}

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
