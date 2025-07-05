import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getQuoteById, getAllVersions, createNewVersion, updateQuoteStatus, generateQuotePdf } from '../services/quoteService';
import MainLayout from '../components/layout/MainLayout';

const QuoteDetailPage = () => {
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getQuoteById(id);
      setQuote(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const response = await getAllVersions(id);
      setVersions(response.data || []);
    } catch (err) {
      console.error('Error fetching versions:', err);
    }
  };

  useEffect(() => {
    fetchQuote();
    fetchVersions();
  }, [id]);

  const handleCreateNewVersion = async () => {
    const changes = prompt('Enter a description of changes for the new version:');
    if (!changes) return;
    
    setSaving(true);
    try {
      await createNewVersion(id, changes);
      await fetchQuote();
      await fetchVersions();
      setToast({ msg: 'New version created successfully!', type: 'success' });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      setToast({ msg: 'Error creating new version', type: 'error' });
      setTimeout(() => setToast(null), 2000);
    }
    setSaving(false);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change the status to "${newStatus}"?`)) return;
    
    setSaving(true);
    try {
      await updateQuoteStatus(id, { status: newStatus });
      await fetchQuote();
      setToast({ msg: 'Status updated successfully!', type: 'success' });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      setToast({ msg: 'Error updating status', type: 'error' });
      setTimeout(() => setToast(null), 2000);
    }
    setSaving(false);
  };

  const handleGeneratePdf = async () => {
    setSaving(true);
    try {
      const response = await generateQuotePdf(id);
      if (response.data.quotePdfUrl) {
        window.open(response.data.quotePdfUrl, '_blank');
        setToast({ msg: 'PDF generated successfully!', type: 'success' });
      }
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      setToast({ msg: 'Error generating PDF', type: 'error' });
      setTimeout(() => setToast(null), 2000);
    }
    setSaving(false);
  };

  const actions = (
    <>
      <button 
        onClick={() => setShowVersionHistory(!showVersionHistory)}
        style={{ 
          marginRight: 12, 
          padding: '8px 16px', 
          background: showVersionHistory ? '#6c757d' : '#17a2b8', 
          color: '#fff', 
          border: 'none', 
          borderRadius: 6, 
          fontWeight: 500, 
          cursor: 'pointer' 
        }}
      >
        {showVersionHistory ? 'Hide' : 'Show'} Version History
      </button>
      {quote?.isLatestVersion && (
        <button 
          onClick={handleCreateNewVersion}
          disabled={saving}
          style={{ 
            marginRight: 12, 
            padding: '8px 16px', 
            background: '#28a745', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 6, 
            fontWeight: 500, 
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1
          }}
        >
          Create New Version
        </button>
      )}
      <button 
        onClick={handleGeneratePdf}
        disabled={saving}
        style={{ 
          marginRight: 12, 
          padding: '8px 16px', 
          background: '#dc3545', 
          color: '#fff', 
          border: 'none', 
          borderRadius: 6, 
          fontWeight: 500, 
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.6 : 1
        }}
      >
        Generate PDF
      </button>
      <Link 
        to="/quotes" 
        style={{ 
          padding: '8px 16px', 
          backgroundColor: '#6c757d', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        Back to Quotes
      </Link>
    </>
  );

  if (loading) {
    return (
      <MainLayout pageTitle="Quote Details" actions={actions}>
        <div className="content-wrapper">
          <p>Loading quote details...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout pageTitle="Quote Details" actions={actions}>
        <div className="content-wrapper">
          <p style={{ color: 'red' }}>Error loading quote: {error}</p>
        </div>
      </MainLayout>
    );
  }

  if (!quote) {
    return (
      <MainLayout pageTitle="Quote Details" actions={actions}>
        <div className="content-wrapper">
          <p>Quote not found.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle={`Quote: ${quote.quoteNumber}`} actions={actions}>
      <div className="content-wrapper">
        {toast && (
          <div style={{ position: 'fixed', top: 24, right: 24, background: toast.type === 'error' ? '#dc3545' : '#28a745', color: '#fff', padding: '12px 24px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 2000, fontWeight: 500 }}>
            {toast.msg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Quote Information */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>Quote Information</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <strong>Quote Number:</strong> {quote.quoteNumber}
              </div>
              <div>
                <strong>Version:</strong> 
                <span style={{ 
                  background: quote.isLatestVersion ? '#28a745' : '#6c757d', 
                  color: 'white', 
                  padding: '2px 6px', 
                  borderRadius: '4px', 
                  fontSize: '12px',
                  fontWeight: '500',
                  marginLeft: '8px'
                }}>
                  v{quote.version || 1}
                  {quote.isLatestVersion && ' (Latest)'}
                </span>
              </div>
              <div>
                <strong>Status:</strong> 
                <span style={{ 
                  background: 
                    quote.status === 'Accepted' ? '#28a745' :
                    quote.status === 'Rejected' ? '#dc3545' :
                    quote.status === 'Expired' ? '#ffc107' :
                    '#007bff', 
                  color: 'white', 
                  padding: '2px 6px', 
                  borderRadius: '4px', 
                  fontSize: '12px',
                  fontWeight: '500',
                  marginLeft: '8px'
                }}>
                  {quote.status}
                </span>
              </div>
              <div>
                <strong>Premium:</strong> {quote.calculatedPremium} {quote.productDetailsSnapshot?.currency}
              </div>
              <div>
                <strong>Created:</strong> {new Date(quote.createdAt).toLocaleString()}
              </div>
              {quote.validUntil && (
                <div>
                  <strong>Valid Until:</strong> {new Date(quote.validUntil).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Status Update */}
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ marginBottom: '12px' }}>Update Status</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Draft', 'Quoted', 'Accepted', 'Rejected', 'Expired'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={saving || quote.status === status}
                    style={{
                      padding: '6px 12px',
                      background: quote.status === status ? '#6c757d' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving || quote.status === status ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      opacity: saving || quote.status === status ? 0.6 : 1
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>Customer Information</h3>
            {quote.customer ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <strong>Name:</strong> {quote.customer.firstName} {quote.customer.lastName}
                </div>
                <div>
                  <strong>Email:</strong> {quote.customer.email}
                </div>
                {quote.customer.phoneNumber && (
                  <div>
                    <strong>Phone:</strong> {quote.customer.phoneNumber}
                  </div>
                )}
                {quote.customer.address && (
                  <div>
                    <strong>Address:</strong> {quote.customer.address.street}, {quote.customer.address.city}, {quote.customer.address.state} {quote.customer.address.zipCode}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: '#999', fontStyle: 'italic' }}>No customer information available</p>
            )}
          </div>
        </div>

        {/* Product Information */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>Product Information</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <strong>Product:</strong> {quote.productDetailsSnapshot?.name}
            </div>
            <div>
              <strong>Type:</strong> {quote.productDetailsSnapshot?.productType}
            </div>
            <div>
              <strong>Base Price:</strong> {quote.productDetailsSnapshot?.basePrice} {quote.productDetailsSnapshot?.currency}
            </div>
          </div>
        </div>

        {/* Quote Inputs */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>Quote Inputs</h3>
          <pre style={{ background: '#f8f9fa', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(quote.quoteInputs, null, 2)}
          </pre>
        </div>

        {/* Version History */}
        {showVersionHistory && (
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>Version History</h3>
            {versions.length > 0 ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {versions.map((version) => (
                  <div key={version._id} style={{ 
                    border: '1px solid #ddd', 
                    borderRadius: '6px', 
                    padding: '12px',
                    background: version._id === quote._id ? '#f8f9fa' : '#fff'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          background: version.isLatestVersion ? '#28a745' : '#6c757d', 
                          color: 'white', 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          v{version.version || 1}
                          {version.isLatestVersion && ' (Latest)'}
                        </span>
                        {version._id === quote._id && (
                          <span style={{ 
                            background: '#007bff', 
                            color: 'white', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            Current
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(version.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#333' }}>
                      <strong>Status:</strong> {version.status}
                    </div>
                    <div style={{ fontSize: '14px', color: '#333' }}>
                      <strong>Premium:</strong> {version.calculatedPremium} {version.productDetailsSnapshot?.currency}
                    </div>
                    {version.versionHistory && version.versionHistory.length > 0 && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                        <strong>Changes:</strong> {version.versionHistory[version.versionHistory.length - 1]?.changes || 'No changes recorded'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#999', fontStyle: 'italic' }}>No version history available</p>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default QuoteDetailPage;
