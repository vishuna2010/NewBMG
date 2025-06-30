import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPolicyById, updatePolicy } from '../services/policyService'; // Assuming policyService.js is created

const PolicyDetailPage = () => {
  const { id: policyId } = useParams();
  const navigate = (path) => window.location.href = path; // Basic navigation for now

  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const policyStatuses = ['PendingActivation', 'Active', 'Expired', 'Cancelled', 'Lapsed', 'PendingRenewal'];


  const fetchPolicy = async () => {
    if (!policyId) {
      setError("No policy ID provided.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getPolicyById(policyId);
      if (response.success && response.data) {
        setPolicy(response.data);
        setNewStatus(response.data.status); // Initialize newStatus for editing
      } else {
        setError(response.error || 'Policy not found.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, [policyId]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus || newStatus === policy.status) {
        setIsEditingStatus(false);
        return;
    }
    setSubmittingStatus(true);
    setError(null);
    try {
      const updatedPolicyData = await updatePolicy(policyId, { status: newStatus });
      setPolicy(updatedPolicyData.data); // Update local policy state
      setIsEditingStatus(false);
      alert('Policy status updated successfully!');
    } catch (err) {
      setError(err.message);
      alert(`Error updating status: ${err.message}`);
    } finally {
      setSubmittingStatus(false);
    }
  };

  // TODO: Functionality for adding/managing documents

  if (loading) return <p>Loading policy details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!policy) return <p>Policy not found.</p>;

  const detailItemStyle = { marginBottom: '10px' };
  const labelStyle = { fontWeight: 'bold', marginRight: '5px' };

  return (
    <div>
      <h1 className="page-title">Policy Details: {policy.policyNumber}</h1>
      <Link to="/admin/policies" style={{display: 'inline-block', marginBottom: '20px'}}>&larr; Back to Policies</Link>

      <div className="content-wrapper">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <section>
            <h3>Policy Information</h3>
            <div style={detailItemStyle}><span style={labelStyle}>Policy Number:</span> {policy.policyNumber}</div>
            <div style={detailItemStyle}><span style={labelStyle}>Status:</span> {policy.status}
              {!isEditingStatus ? (
                <button onClick={() => { setNewStatus(policy.status); setIsEditingStatus(true); }} style={{ marginLeft: '10px', fontSize: '0.8em' }}>Change Status</button>
              ) : (
                <form onSubmit={handleStatusUpdate} style={{ display: 'inline-block', marginLeft: '10px' }}>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{marginRight: '5px'}}>
                    {policyStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button type="submit" disabled={submittingStatus} style={{fontSize: '0.8em'}}>{submittingStatus ? 'Saving...' : 'Save'}</button>
                  <button type="button" onClick={() => setIsEditingStatus(false)} style={{marginLeft: '5px', fontSize: '0.8em'}}>Cancel</button>
                </form>
              )}
            </div>
            <div style={detailItemStyle}><span style={labelStyle}>Effective Date:</span> {new Date(policy.effectiveDate).toLocaleDateString()}</div>
            <div style={detailItemStyle}><span style={labelStyle}>Expiry Date:</span> {new Date(policy.expiryDate).toLocaleDateString()}</div>
            <div style={detailItemStyle}><span style={labelStyle}>Term:</span> {policy.term}</div>
            <div style={detailItemStyle}><span style={labelStyle}>Premium:</span> {policy.premiumAmount} {policy.premiumCurrency}</div>
            <div style={detailItemStyle}><span style={labelStyle}>Payment Schedule:</span> {policy.paymentSchedule}</div>
          </section>

          <section>
            <h3>Customer Information</h3>
            {policy.customer ? (
              <>
                <div style={detailItemStyle}><span style={labelStyle}>Name:</span> {policy.customer.firstName} {policy.customer.lastName}</div>
                <div style={detailItemStyle}><span style={labelStyle}>Email:</span> {policy.customer.email}</div>
                <div style={detailItemStyle}><span style={labelStyle}>Phone:</span> {policy.customer.phoneNumber || 'N/A'}</div>
                {/* Consider adding a link to the customer's detail page if one exists */}
              </>
            ) : <p>Customer details not available.</p>}
          </section>

          <section>
            <h3>Product Information</h3>
            {policy.product ? (
              <>
                <div style={detailItemStyle}><span style={labelStyle}>Name:</span> {policy.product.name}</div>
                <div style={detailItemStyle}><span style={labelStyle}>Type:</span> {policy.product.productType}</div>
                {/* Consider adding a link to the product's detail page if one exists */}
              </>
            ) : <p>Product details not available.</p>}
          </section>

          <section>
             <h3>Original Quote</h3>
             {policy.originalQuote ? (
                <div style={detailItemStyle}>
                    <span style={labelStyle}>Quote Number:</span>
                    {/* TODO: Link to quote detail page if it exists */}
                    {policy.originalQuote.quoteNumber || policy.originalQuote._id}
                    ({policy.originalQuote.calculatedPremium} {policy.originalQuote.productDetailsSnapshot?.currency})
                </div>
             ) : <p>Original quote reference missing.</p>}
          </section>
        </div>

        <hr style={{margin: '20px 0'}}/>

        <section>
            <h3>Policy Details Snapshot</h3>
            <div style={detailItemStyle}><span style={labelStyle}>Product Name at Issuance:</span> {policy.policyDetailsSnapshot?.productName}</div>
            <div style={detailItemStyle}><span style={labelStyle}>Product Type at Issuance:</span> {policy.policyDetailsSnapshot?.productType}</div>
            <h4>Coverages/Inputs from Quote:</h4>
            <pre style={{backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
                {JSON.stringify(policy.policyDetailsSnapshot?.coverages || policy.policyDetailsSnapshot?.quoteInputs || {}, null, 2)}
            </pre>
        </section>

        <hr style={{margin: '20px 0'}}/>

        <section>
          <h3>Policy Documents</h3>
          {/* TODO: Implement document upload and listing */}
          {policy.documents && policy.documents.length > 0 ? (
            <ul style={{listStyle: 'none', paddingLeft: 0}}>
              {policy.documents.map((doc, index) => (
                <li key={index} style={{border: '1px solid #eee', padding: '10px', marginBottom: '5px', borderRadius: '4px'}}>
                  <strong>{doc.documentName}</strong> ({doc.documentType}) - Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                  <br />
                  <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer">View/Download</a>
                  {/* TODO: Delete document option */}
                </li>
              ))}
            </ul>
          ) : <p>No documents uploaded for this policy yet.</p>}
          {/* <button>Upload New Document</button> */}
        </section>
      </div>
    </div>
  );
};

export default PolicyDetailPage;
