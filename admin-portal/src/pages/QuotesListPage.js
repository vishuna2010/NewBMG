import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllQuotes, createNewVersion } from '../services/quoteService';
import MainLayout from '../components/layout/MainLayout';

const PAGE_SIZE = 10;

function exportToCSV(data, filename = 'quotes.csv') {
  const replacer = (key, value) => (value === null ? '' : value);
  const header = ['quoteNumber', 'version', 'customer', 'status', 'createdAt'];
  const csv = [
    header.join(','),
    ...data.map(row => header.map(fieldName => {
      if (fieldName === 'customer') {
        return JSON.stringify(row.customer ? `${row.customer.firstName} ${row.customer.lastName}` : 'N/A', replacer);
      }
      return JSON.stringify(row[fieldName], replacer);
    }).join(','))
  ].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

const QuotesListPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ field: 'createdAt', dir: 'desc' });
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

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

  // Filtered, sorted, paginated quotes
  const filteredQuotes = quotes.filter(q => {
    const matchesSearch =
      q.quoteNumber?.toLowerCase().includes(search.toLowerCase()) ||
      q.status?.toLowerCase().includes(search.toLowerCase()) ||
      (q.customer && `${q.customer.firstName} ${q.customer.lastName}`.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' ? true : q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    if (a[sort.field] < b[sort.field]) return -1 * dir;
    if (a[sort.field] > b[sort.field]) return 1 * dir;
    return 0;
  });
  const totalPages = Math.ceil(sortedQuotes.length / PAGE_SIZE) || 1;
  const pagedQuotes = sortedQuotes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field) => {
    setSort(prev => ({
      field,
      dir: prev.field === field ? (prev.dir === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

  useEffect(() => {
    setPage(1); // Reset to first page on search/filter/sort change
  }, [search, statusFilter, sort.field, sort.dir]);

  // Bulk select helpers
  const allOnPageSelected = pagedQuotes.length > 0 && pagedQuotes.every(q => selected.includes(q._id));
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(prev => Array.from(new Set([...prev, ...pagedQuotes.map(q => q._id)])));
    } else {
      setSelected(prev => prev.filter(id => !pagedQuotes.some(q => q._id === id)));
    }
  };
  const handleSelectRow = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(`Delete ${selected.length} selected quotes?`)) return;
    setSaving(true);
    try {
      // You would call your delete API here for each selected quote
      // For demo, just remove from UI
      setQuotes(prev => prev.filter(q => !selected.includes(q._id)));
      setSelected([]);
      setToast({ msg: 'Selected quotes deleted!', type: 'success' });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      setToast({ msg: 'Error deleting selected quotes', type: 'error' });
      setTimeout(() => setToast(null), 2000);
    }
    setSaving(false);
  };

  const handleCreateNewVersion = async (quoteId) => {
    const changes = prompt('Enter a description of changes for the new version:');
    if (!changes) return;
    
    setSaving(true);
    try {
      await createNewVersion(quoteId, changes);
      await fetchQuotes(); // Refresh the list
      setToast({ msg: 'New version created successfully!', type: 'success' });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      setToast({ msg: 'Error creating new version', type: 'error' });
      setTimeout(() => setToast(null), 2000);
    }
    setSaving(false);
  };

  const actions = (
    <>
      <button onClick={() => exportToCSV(sortedQuotes)} style={{ marginRight: 12, padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>Export CSV</button>
      <button onClick={handleBulkDelete} disabled={selected.length === 0 || saving} style={{ marginRight: 12, padding: '8px 16px', background: selected.length === 0 ? '#ccc' : '#dc3545', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, cursor: selected.length === 0 ? 'not-allowed' : 'pointer' }}>Bulk Delete</button>
      <Link 
        to="/quotes/new" 
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
        <span>+</span> Create New Quote
      </Link>
    </>
  );

  return (
    <MainLayout pageTitle="Quotes" actions={actions}>
      <div className="content-wrapper">
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by quote number, status, or customer name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 180 }}
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        {toast && (
          <div style={{ position: 'fixed', top: 24, right: 24, background: toast.type === 'error' ? '#dc3545' : '#28a745', color: '#fff', padding: '12px 24px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 2000, fontWeight: 500 }}>
            {toast.msg}
          </div>
        )}
        {loading ? <p>Loading quotes...</p> : error ? <p style={{ color: 'red' }}>Error fetching quotes: {error}</p> : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>
                    <input type="checkbox" checked={allOnPageSelected} onChange={handleSelectAll} />
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('quoteNumber')}>
                    Quote Number {sort.field === 'quoteNumber' ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('version')}>
                    Version {sort.field === 'version' ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>
                    Customer
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('status')}>
                    Status {sort.field === 'status' ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('createdAt')}>
                    Created At {sort.field === 'createdAt' ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedQuotes.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: '#888', padding: 16 }}>No quotes found.</td></tr>
                ) : pagedQuotes.map((quote) => (
                  <tr key={quote._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>
                      <input type="checkbox" checked={selected.includes(quote._id)} onChange={() => handleSelectRow(quote._id)} />
                    </td>
                    <td style={{ padding: '8px' }}>{quote.quoteNumber}</td>
                    <td style={{ padding: '8px' }}>
                      <span style={{ 
                        background: quote.isLatestVersion ? '#28a745' : '#6c757d', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        v{quote.version || 1}
                        {quote.isLatestVersion && ' (Latest)'}
                      </span>
                    </td>
                    <td style={{ padding: '8px' }}>
                      {quote.customer ? (
                        <div>
                          <div style={{ fontWeight: '500' }}>{quote.customer.firstName} {quote.customer.lastName}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{quote.customer.email}</div>
                        </div>
                      ) : (
                        <span style={{ color: '#999', fontStyle: 'italic' }}>No customer</span>
                      )}
                    </td>
                    <td style={{ padding: '8px' }}>{quote.status}</td>
                    <td style={{ padding: '8px' }}>{new Date(quote.createdAt).toLocaleString()}</td>
                    <td style={{ padding: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Link to={`/quotes/${quote._id}`} style={{ color: '#007bff', textDecoration: 'none' }}>View</Link>
                        {quote.isLatestVersion && (
                          <button 
                            onClick={() => handleCreateNewVersion(quote._id)}
                            disabled={saving}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: '#28a745', 
                              cursor: 'pointer',
                              fontSize: '12px',
                              textDecoration: 'underline'
                            }}
                          >
                            New Version
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 16 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #ccc', background: page === 1 ? '#f0f0f0' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Prev</button>
              <span style={{ fontSize: 14 }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #ccc', background: page === totalPages ? '#f0f0f0' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default QuotesListPage;
