import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import EmailTemplateForm from '../components/emailtemplates/EmailTemplateForm';
import { createEmailTemplate } from '../services/emailTemplateService';

const EmailTemplateCreatePage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await createEmailTemplate(formData);
      console.log('Email Template created:', result);
      alert('Email template created successfully!');
      navigate('/admin/email-templates'); // Redirect to templates list page
    } catch (err) {
      setError(err.message || 'An unknown error occurred.');
      alert(`Error creating email template: ${err.message || 'An unknown error occurred.'}`);
      // setSubmitting(false); // Keep submitting false if error, so user can try again
    } finally {
        setSubmitting(false); // Ensure submitting is reset regardless of outcome
    }
  };

  return (
    <div>
      <h1 className="page-title">Create New Email Template</h1>
      <Link to="/admin/email-templates" style={{display: 'inline-block', marginBottom: '20px'}}>&larr; Back to Templates List</Link>
      <div className="content-wrapper">
        {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px', marginBottom: '10px' }}>Error: {error}</p>}
        <EmailTemplateForm onSubmit={handleSubmit} isEditMode={false} />
        {submitting && <p>Creating template...</p>}
      </div>
    </div>
  );
};

export default EmailTemplateCreatePage;
