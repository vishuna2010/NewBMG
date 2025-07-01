import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllEmailTemplates, deleteEmailTemplate } from '../services/emailTemplateService';

const EmailTemplatesListPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllEmailTemplates();
      setTemplates(response.data || []);
    } catch (err) {
      setError(err.message);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (templateIdentifier) => {
    // Use templateName for confirmation as it's more user-friendly than ID
    const templateToDelete = templates.find(t => t._id === templateIdentifier || t.templateName === templateIdentifier);
    const confirmName = templateToDelete ? templateToDelete.templateName : templateIdentifier;

    if (window.confirm(`Are you sure you want to delete the template "${confirmName}"? This action cannot be undone.`)) {
      try {
        await deleteEmailTemplate(templateIdentifier);
        setTemplates(templates.filter(t => t._id !== templateIdentifier && t.templateName !== templateIdentifier));
        alert(`Email template "${confirmName}" deleted successfully!`);
      } catch (err) {
        setError(err.message);
        alert(`Failed to delete template: ${err.message}`);
      }
    }
  };

  if (loading) return <p>Loading email templates...</p>;
  if (error && templates.length === 0) return <p style={{ color: 'red' }}>Error fetching email templates: {error}</p>;

  const buttonStyle = {
    marginBottom: '20px', display: 'inline-block', padding: '10px 15px',
    backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px'
  };

  return (
    <div>
      <h1 className="page-title">Email Template Management</h1>
      <div className="content-wrapper">
        <Link to="/admin/email-templates/new" style={buttonStyle}>+ Create New Template</Link>

        {error && <p style={{ color: 'red', marginBottom: '10px' }}>Operation failed: {error}</p>}

        {templates.length === 0 && !loading ? (
          <p>No email templates found. Click "Create New Template" to add one.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Template Name</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Subject</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{template.templateName}</td>
                  <td style={{ padding: '8px' }}>{template.subject}</td>
                  <td style={{ padding: '8px' }}>{template.description || 'N/A'}</td>
                  <td style={{ padding: '8px' }}>{template.isActive ? 'Active' : 'Inactive'}</td>
                  <td style={{ padding: '8px' }}>
                    <Link to={`/admin/email-templates/edit/${template.templateName}`} style={{ marginRight: '10px', color: '#007bff' }}>Edit</Link>
                    <button
                        onClick={() => handleDelete(template.templateName)} // Use templateName for delete identifier
                        style={{ color: 'red', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    >
                        Delete
                    </button>
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

export default EmailTemplatesListPage;
