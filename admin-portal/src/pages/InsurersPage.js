import React, { useEffect, useState, useRef } from 'react';
import MainLayout from '../components/layout/MainLayout';

const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3004/api/v1/insurers';
const PAGE_SIZE = 10;

function exportToCSV(data, filename = 'insurers.csv') {
  const replacer = (key, value) => (value === null ? '' : value);
  const header = ['name', 'address', 'contactEmail', 'contactPhone', 'website', 'active'];
  const csv = [
    header.join(','),
    ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
  ].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

const InsurersPage = () => {
  const [insurers, setInsurers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', contactEmail: '', contactPhone: '', website: '', active: true });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ field: 'name', dir: 'asc' });
  const [selected, setSelected] = useState([]);
  const [filterActive, setFilterActive] = useState('all');
  const [filterDomain, setFilterDomain] = useState('');
  const addInputRef = useRef(null);
  const editInputRef = useRef(null);
  const [formError, setFormError] = useState('');

  const fetchInsurers = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setInsurers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch insurers');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInsurers();
  }, []);

  useEffect(() => {
    if (showAdd && addInputRef.current) addInputRef.current.focus();
    if (showEdit && editInputRef.current) editInputRef.current.focus();
  }, [showAdd, showEdit]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (form.contactEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.contactEmail)) return 'Invalid email address.';
    return null;
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleAddInsurer = async (e) => {
    e.preventDefault();
    const validation = validateForm();
    if (validation) {
      setFormError(validation);
      return showToast(validation, 'error');
    }
    setFormError('');
    setSaving(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to add insurer');
      setForm({ name: '', address: '', contactEmail: '', contactPhone: '', website: '', active: true });
      setShowAdd(false);
      fetchInsurers();
      showToast('Insurer added!');
    } catch (err) {
      showToast('Error adding insurer', 'error');
    }
    setSaving(false);
  };

  const openEdit = (ins) => {
    setEditId(ins._id);
    setForm({
      name: ins.name || '',
      address: ins.address || '',
      contactEmail: ins.contactEmail || '',
      contactPhone: ins.contactPhone || '',
      website: ins.website || '',
      active: !!ins.active
    });
    setShowEdit(true);
  };

  const handleEditInsurer = async (e) => {
    e.preventDefault();
    const validation = validateForm();
    if (validation) {
      setFormError(validation);
      return showToast(validation, 'error');
    }
    setFormError('');
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to update insurer');
      setShowEdit(false);
      setEditId(null);
      setForm({ name: '', address: '', contactEmail: '', contactPhone: '', website: '', active: true });
      fetchInsurers();
      showToast('Insurer updated!');
    } catch (err) {
      showToast('Error updating insurer', 'error');
    }
    setSaving(false);
  };

  const handleDeleteInsurer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this insurer?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete insurer');
      fetchInsurers();
      showToast('Insurer deleted!');
      setSelected(selected.filter(sid => sid !== id));
    } catch (err) {
      showToast('Error deleting insurer', 'error');
    }
    setDeletingId(null);
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(`Delete ${selected.length} selected insurers?`)) return;
    setSaving(true);
    try {
      await Promise.all(selected.map(id => fetch(`${API_URL}/${id}`, { method: 'DELETE' })));
      fetchInsurers();
      showToast('Selected insurers deleted!');
      setSelected([]);
    } catch (err) {
      showToast('Error deleting selected insurers', 'error');
    }
    setSaving(false);
  };

  // Advanced filters
  const filteredInsurers = insurers.filter(ins => {
    const matchesSearch =
      ins.name.toLowerCase().includes(search.toLowerCase()) ||
      (ins.contactEmail && ins.contactEmail.toLowerCase().includes(search.toLowerCase()));
    const matchesActive =
      filterActive === 'all' ? true : (filterActive === 'active' ? ins.active : !ins.active);
    const matchesDomain =
      !filterDomain.trim() || (ins.contactEmail && ins.contactEmail.toLowerCase().endsWith(filterDomain.toLowerCase()));
    return matchesSearch && matchesActive && matchesDomain;
  });
  const sortedInsurers = [...filteredInsurers].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    if (a[sort.field] < b[sort.field]) return -1 * dir;
    if (a[sort.field] > b[sort.field]) return 1 * dir;
    return 0;
  });
  const totalPages = Math.ceil(sortedInsurers.length / PAGE_SIZE) || 1;
  const pagedInsurers = sortedInsurers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field) => {
    setSort(prev => ({
      field,
      dir: prev.field === field ? (prev.dir === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

  useEffect(() => {
    setPage(1); // Reset to first page on search or sort change
  }, [search, sort.field, sort.dir, filterActive, filterDomain]);

  // Bulk select helpers
  const allOnPageSelected = pagedInsurers.length > 0 && pagedInsurers.every(ins => selected.includes(ins._id));
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(prev => Array.from(new Set([...prev, ...pagedInsurers.map(ins => ins._id)])));
    } else {
      setSelected(prev => prev.filter(id => !pagedInsurers.some(ins => ins._id === id)));
    }
  };
  const handleSelectRow = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.25)',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s',
  };
  const modalStyle = {
    background: '#fff',
    padding: 32,
    borderRadius: 12,
    minWidth: 320,
    maxWidth: 400,
    width: '90vw',
    boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
    position: 'relative',
    animation: 'modalPop 0.2s',
  };
  const closeBtnStyle = {
    position: 'absolute',
    top: 12,
    right: 16,
    background: 'none',
    border: 'none',
    fontSize: 22,
    color: '#888',
    cursor: 'pointer',
    fontWeight: 700,
    zIndex: 2,
    lineHeight: 1,
  };

  return (
    <MainLayout pageTitle="Insurer & Carrier Management" actions={
      <>
        <button onClick={() => exportToCSV(sortedInsurers)} style={{ marginRight: 12, padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>Export CSV</button>
        <button onClick={handleBulkDelete} disabled={selected.length === 0 || saving} style={{ marginRight: 12, padding: '8px 16px', background: selected.length === 0 ? '#ccc' : '#dc3545', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, cursor: selected.length === 0 ? 'not-allowed' : 'pointer' }}>Bulk Delete</button>
        <button onClick={() => setShowAdd(true)} style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>+ Add Insurer</button>
      </>
    }>
      <div className="content-wrapper">
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 180 }}
          />
          <select value={filterActive} onChange={e => setFilterActive(e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <input
            type="text"
            placeholder="Email domain (e.g. @acme.com)"
            value={filterDomain}
            onChange={e => setFilterDomain(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 160 }}
          />
          {loading && <span style={{ color: '#888', fontSize: 14 }}>Loading...</span>}
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
          <thead>
            <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
              <th style={{ padding: 8, textAlign: 'left' }}>
                <input type="checkbox" checked={allOnPageSelected} onChange={handleSelectAll} />
              </th>
              <th style={{ padding: 8, textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                Name {sort.field === 'name' ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{ padding: 8, textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('contactEmail')}>
                Contact Email {sort.field === 'contactEmail' ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{ padding: 8, textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('contactPhone')}>
                Contact Phone {sort.field === 'contactPhone' ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{ padding: 8, textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('website')}>
                Website {sort.field === 'website' ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{ padding: 8, textAlign: 'left', cursor: 'pointer' }} onClick={() => handleSort('active')}>
                Active {sort.field === 'active' ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{ padding: 8, textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedInsurers.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#888', padding: 16 }}>No insurers found.</td></tr>
            ) : pagedInsurers.map((ins) => (
              <tr key={ins._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: 8 }}>
                  <input type="checkbox" checked={selected.includes(ins._id)} onChange={() => handleSelectRow(ins._id)} />
                </td>
                <td style={{ padding: 8 }}>{ins.name}</td>
                <td style={{ padding: 8 }}>{ins.contactEmail}</td>
                <td style={{ padding: 8 }}>{ins.contactPhone}</td>
                <td style={{ padding: 8 }}><a href={ins.website} target="_blank" rel="noopener noreferrer">{ins.website}</a></td>
                <td style={{ padding: 8 }}>{ins.active ? 'Yes' : 'No'}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => openEdit(ins)} style={{ marginRight: 8, background: '#ffc107', color: '#333', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDeleteInsurer(ins._id)} disabled={deletingId === ins._id} style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>{deletingId === ins._id ? 'Deleting...' : 'Delete'}</button>
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
      </div>
      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, background: toast.type === 'error' ? '#dc3545' : '#28a745', color: '#fff', padding: '12px 24px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 2000, fontWeight: 500 }}>
          {toast.msg}
        </div>
      )}
      {/* Add Modal */}
      {showAdd && (
        <div style={modalOverlayStyle}>
          <form onSubmit={handleAddInsurer} style={modalStyle}>
            <button type="button" aria-label="Close" style={closeBtnStyle} onClick={() => setShowAdd(false)}>&times;</button>
            <h2 style={{ marginTop: 0, marginBottom: 18 }}>Add Insurer</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}>Name*<br />
                <input ref={addInputRef} name="name" value={form.name} onChange={handleInputChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </label>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}>Address<br />
                <input name="address" value={form.address} onChange={handleInputChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </label>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}>Contact Email<br />
                <input name="contactEmail" value={form.contactEmail} onChange={handleInputChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </label>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}>Contact Phone<br />
                <input name="contactPhone" value={form.contactPhone} onChange={handleInputChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </label>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}>Website<br />
                <input name="website" value={form.website} onChange={handleInputChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </label>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}><input type="checkbox" name="active" checked={form.active} onChange={handleInputChange} style={{ marginRight: 8 }} /> Active</label>
            </div>
            {formError && <div style={{ color: '#dc3545', marginBottom: 12, fontWeight: 500 }}>{formError}</div>}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="submit" disabled={saving} style={{ background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 500 }}>{saving ? 'Saving...' : 'Add'}</button>
              <button type="button" onClick={() => setShowAdd(false)} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '8px 16px' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {/* Edit Modal */}
      {showEdit && (
        <div style={modalOverlayStyle}>
          <form onSubmit={handleEditInsurer} style={modalStyle}>
            <button type="button" aria-label="Close" style={closeBtnStyle} onClick={() => { setShowEdit(false); setEditId(null); }}>&times;</button>
            <h2 style={{ marginTop: 0, marginBottom: 18 }}>Edit Insurer</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}>Name*<br />
                <input ref={editInputRef} name="name" value={form.name} onChange={handleInputChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </label>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}>Address<br />
                <input name="address" value={form.address} onChange={handleInputChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </label>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}>Contact Email<br />
                <input name="contactEmail" value={form.contactEmail} onChange={handleInputChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </label>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}>Contact Phone<br />
                <input name="contactPhone" value={form.contactPhone} onChange={handleInputChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </label>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}>Website<br />
                <input name="website" value={form.website} onChange={handleInputChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', marginTop: 4 }} />
              </label>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}><input type="checkbox" name="active" checked={form.active} onChange={handleInputChange} style={{ marginRight: 8 }} /> Active</label>
            </div>
            {formError && <div style={{ color: '#dc3545', marginBottom: 12, fontWeight: 500 }}>{formError}</div>}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="submit" disabled={saving} style={{ background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 500 }}>{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => { setShowEdit(false); setEditId(null); }} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '8px 16px' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </MainLayout>
  );
};

export default InsurersPage;
