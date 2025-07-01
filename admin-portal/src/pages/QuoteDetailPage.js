import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getQuoteById, updateQuoteStatus } from '../services/quoteService';
import { createPolicyFromQuote } from '../services/policyService'; // For "Convert to Policy"

const QuoteDetailPage = () => {
  const { id: quoteId } = useParams();
  const navigate = useNavigate();

  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [submittingPolicy, setSubmittingPolicy] = useState(false);

  // Define statuses admin can typically set. 'Accepted' might have a different flow (e.g. customer accepts)
  // but admin might need to override or manually set it.
  const adminSettableStatuses = ['Draft', 'Quoted', 'Accepted', 'Rejected', 'Expired'];

  const fetchQuote = async () => {
    if (!quoteId) {
      setError("No quote ID provided.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getQuoteById(quoteId);
      if (response.success && response.data) {
        setQuote(response.data);
        setNewStatus(response.data.status);
      } else {
        setError(response.error || 'Quote not found.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, [quoteId, fetchQuote]); // Added fetchQuote

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus || newStatus === quote.status) {
      setIsEditingStatus(false);
      return;
    }
    setSubmittingStatus(true);
    setError(null);
    try {
      const updatedQuoteData = await updateQuoteStatus(quoteId, { status: newStatus });
      setQuote(updatedQuoteData.data);
      setIsEditingStatus(false);
      alert('Quote status updated successfully!');
    } catch (err) {
      setError(err.message);
      alert(`Error updating status: ${err.message}`);
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleConvertToPolicy = async () => {
    if (quote.status !== 'Accepted') {
        alert("Quote must be in 'Accepted' status to be converted to a policy.");
        return;
    }
    if (!window.confirm(`Are you sure you want to convert quote ${quote.quoteNumber} to a policy?`)) {
        return;
    }

    setSubmittingPolicy(true);
    setError(null);
    try {
        const policyResponse = await createPolicyFromQuote(quote._id);
        if (policyResponse.success && policyResponse.data) {
            alert(`Policy ${policyResponse.data.policyNumber} created successfully from quote ${quote.quoteNumber}!`);
            // Optionally navigate to the new policy's detail page
            navigate(`/admin/policies/${policyResponse.data._id}`);
            // Or refresh quote data as its status would have changed
            // fetchQuote();
        } else {
            throw new Error(policyResponse.error || "Failed to create policy.");
        }
    } catch (err) {
        setError(err.message);
        alert(`Error converting quote to policy: ${err.message}`);
    } finally {
        setSubmittingPolicy(false);
    }
  };

  if (loading) return <p>Loading quote details...</p>;
  if (error && !quote) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!quote) return <p>Quote not found.</p>;

  const detailItemStyle = { marginBottom: '10px' };
  const labelStyle = { fontWeight: 'bold', marginRight: '5px' };

  return (
    <div>
      <h1 className="page-title">Quote Details: {quote.quoteNumber}</h1>
      <Link to="/admin/quotes" style={{display: 'inline-block', marginBottom: '20px'}}>&larr; Back to Quotes List</Link>

      {error && <p style={{color: 'red', border: '1px solid red', padding: '10px', marginBottom: '10px'}}>Error: {error}</p>}

      <div className="content-wrapper">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <section>
            <h3>Quote Information</h3>
            <div style={detailItemStyle}><span style={labelStyle}>Quote Number:</span> {quote.quoteNumber}</div>
            <div style={detailItemStyle}><span style={labelStyle}>Status:</span> {quote.status}
              {!isEditingStatus && quote.status !== 'ConvertedToPolicy' ? (
                <button onClick={() => { setNewStatus(quote.status); setIsEditingStatus(true); }} style={{ marginLeft: '10px', fontSize: '0.8em' }}>Change Status</button>
              ) : quote.status === 'ConvertedToPolicy' ? (
                <span style={{marginLeft: '10px', fontStyle: 'italic'}}>(Converted to Policy)</span>
              ) : (
                <form onSubmit={handleStatusUpdate} style={{ display: 'inline-block', marginLeft: '10px' }}>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{marginRight: '5px'}}>
                    {adminSettableStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button type="submit" disabled={submittingStatus} style={{fontSize: '0.8em'}}>{submittingStatus ? 'Saving...' : 'Save'}</button>
                  <button type="button" onClick={() => setIsEditingStatus(false)} style={{marginLeft: '5px', fontSize: '0.8em'}}>Cancel</button>
                </form>
              )}
            </div>
            <div style={detailItemStyle}><span style={labelStyle}>Calculated Premium:</span> {quote.calculatedPremium} {quote.productDetailsSnapshot?.currency}</div>
            <div style={detailItemStyle}><span style={labelStyle}>Valid Until:</span> {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}</div>
            <div style={detailItemStyle}><span style={labelStyle}>Created At:</span> {new Date(quote.createdAt).toLocaleString()}</div>
            <div style={detailItemStyle}><span style={labelStyle}>Last Updated:</span> {new Date(quote.updatedAt).toLocaleString()}</div>
            {quote.notes && <div style={detailItemStyle}><span style={labelStyle}>Notes:</span> {quote.notes}</div>}
          </section>

          <section>
            <h3>Customer Information</h3>
            {quote.customer ? (
              <>
                <div style={detailItemStyle}><span style={labelStyle}>Name:</span> {quote.customer.firstName} {quote.customer.lastName}</div>
                <div style={detailItemStyle}><span style={labelStyle}>Email:</span> {quote.customer.email}</div>
                {/* Link to customer page: <Link to={`/admin/users/edit/${quote.customer._id}`}>View Customer</Link> */}
              </>
            ) : <p>No customer associated.</p>}
          </section>

          <section>
            <h3>Product Snapshot</h3>
            <div style={detailItemStyle}><span style={labelStyle}>Name:</span> {quote.productDetailsSnapshot?.name}</div>
            <div style={detailItemStyle}><span style={labelStyle}>Type:</span> {quote.productDetailsSnapshot?.productType}</div>
            <div style={detailItemStyle}><span style={labelStyle}>Base Price at Quoting:</span> {quote.productDetailsSnapshot?.basePrice} {quote.productDetailsSnapshot?.currency}</div>
            {/* Link to actual product: <Link to={`/admin/products/edit/${quote.product?._id}`}>View Product</Link> */}
          </section>
        </div>

        <hr style={{margin: '20px 0'}}/>
        <section>
            <h4>Quote Inputs (Dynamic Form Data)</h4>
            <pre style={{backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
                {JSON.stringify(quote.quoteInputs || {}, null, 2)}
            </pre>
        </section>

        {quote.status === 'Accepted' && (
            <div style={{marginTop: '20px'}}>
                <button
                    onClick={handleConvertToPolicy}
                    disabled={submittingPolicy}
                    style={{padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
                >
                    {submittingPolicy ? 'Converting...' : 'Convert to Policy'}
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default QuoteDetailPage;
