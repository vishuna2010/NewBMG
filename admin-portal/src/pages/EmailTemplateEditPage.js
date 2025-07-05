import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import EmailTemplateForm from '../components/emailtemplates/EmailTemplateForm';
import { getEmailTemplate, updateEmailTemplate } from '../services/emailTemplateService';

const EmailTemplateEditPage = () => {
  const { identifier } = useParams(); // Can be ID or templateName
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTemplate = useCallback(async () => {
    if (!identifier) {
      setError("No template identifier provided.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getEmailTemplate(identifier);
      if (response.success && response.data) {
        setTemplate(response.data);
      } else {
        setError(response.error || 'Email template not found.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [identifier]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError(null);
    // templateName is not part of formData from the form when editing if disabled,
    // or if it is, we might not want to send it in the update payload if it's immutable.
    // The backend update controller can handle finding by identifier and updating other fields.
    // For safety, explicitly exclude templateName from the update payload if it's not meant to be changed.
    const { templateName, ...updateData } = formData; // eslint-disable-line no-unused-vars

    try {
      await updateEmailTemplate(identifier, updateData); // Use original identifier for lookup
      alert('Email template updated successfully!');
      navigate('/admin/email-templates');
    } catch (err) {
      setError(err.message);
      alert(`Error updating email template: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading email template details...</p>;
  if (error && !template) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!template) return <p>Email template not found.</p>;

  return (
    <div>
      <h1 className="page-title">Edit Email Template: {template.templateName}</h1>
      <Link to="/admin/email-templates" style={{display: 'inline-block', marginBottom: '20px'}}>&larr; Back to Templates List</Link>
      <div className="content-wrapper">
        {error && <p style={{ color: 'red', marginBottom: '10px' }}>Submit Error: {error}</p>}
        <EmailTemplateForm
            initialData={template}
            onSubmit={handleSubmit}
            isEditMode={true}
        />
        {submitting && <p>Updating template...</p>}
      </div>
    </div>
  );
};

export default EmailTemplateEditPage;
