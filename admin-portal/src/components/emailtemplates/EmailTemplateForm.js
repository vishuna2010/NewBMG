import React, { useState, useEffect } from 'react';

const EmailTemplateForm = ({ initialData = {}, onSubmit, isEditMode = false }) => {
  const [formData, setFormData] = useState({
    templateName: '',
    subject: '',
    htmlBody: '',
    textBody: '',
    placeholders: '', // Will be stored as comma-separated string, then converted to array
    description: '',
    isActive: true,
  });

  useEffect(() => {
    if (isEditMode && initialData && Object.keys(initialData).length > 0) {
      setFormData({
        templateName: initialData.templateName || '',
        subject: initialData.subject || '',
        htmlBody: initialData.htmlBody || '',
        textBody: initialData.textBody || '',
        placeholders: Array.isArray(initialData.placeholders) ? initialData.placeholders.join(', ') : '',
        description: initialData.description || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    } else if (!isEditMode) { // Reset for create mode if initialData was from a previous edit
        setFormData({
            templateName: '', subject: '', htmlBody: '', textBody: '',
            placeholders: '', description: '', isActive: true,
        });
    }
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      // Convert comma-separated placeholders string to an array of strings, trimming whitespace
      placeholders: formData.placeholders.split(',').map(p => p.trim()).filter(p => p), // Filter out empty strings
    };
    onSubmit(dataToSubmit);
  };

  const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '700px' };
  const labelStyle = { fontWeight: 'bold', marginBottom: '5px', display: 'block' };
  const inputStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box' };
  const textAreaStyle = { ...inputStyle, minHeight: '150px', fontFamily: 'monospace' };
  const buttonStyle = { padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <div>
        <label htmlFor="templateName" style={labelStyle}>Template Name (e.g., "welcomeUser", "quoteAccepted"):</label>
        <input
          type="text" id="templateName" name="templateName"
          value={formData.templateName} onChange={handleChange}
          required style={inputStyle}
          disabled={isEditMode} // Template name should not be changed after creation
          title={isEditMode ? "Template name cannot be changed after creation." : "Unique identifier, alphanumeric, underscores, hyphens."}
          pattern={isEditMode ? undefined : "^[a-zA-Z0-9_-]+$"} // Pattern only for creation
        />
        {isEditMode && <small>Template name cannot be changed.</small>}
        {!isEditMode && <small>Can only contain alphanumeric characters, underscores, and hyphens (e.g., welcome_User-V1).</small>}
      </div>
      <div>
        <label htmlFor="subject" style={labelStyle}>Subject (Placeholders e.g., `{{firstName}}`):</label>
        <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required style={inputStyle} />
      </div>
      <div>
        <label htmlFor="description" style={labelStyle}>Description (Admin reference):</label>
        <input type="text" id="description" name="description" value={formData.description} onChange={handleChange} style={inputStyle} />
      </div>
      <div>
        <label htmlFor="htmlBody" style={labelStyle}>HTML Body (Placeholders e.g., `{{quoteNumber}}`):</label>
        <textarea id="htmlBody" name="htmlBody" value={formData.htmlBody} onChange={handleChange} required style={textAreaStyle} />
      </div>
      <div>
        <label htmlFor="textBody" style={labelStyle}>Text Body (Optional, for non-HTML clients):</label>
        <textarea id="textBody" name="textBody" value={formData.textBody} onChange={handleChange} style={{...textAreaStyle, minHeight: '80px'}} />
      </div>
      <div>
        <label htmlFor="placeholders" style={labelStyle}>Placeholders (Comma-separated, e.g., `firstName, quoteNumber, link`):</label>
        <input type="text" id="placeholders" name="placeholders" value={formData.placeholders} onChange={handleChange} style={inputStyle} />
        <small>List of available placeholders for this template (for admin reference only).</small>
      </div>
      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
        <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ marginRight: '5px' }} />
        <label htmlFor="isActive">Is Active</label>
      </div>
      <button type="submit" style={{...buttonStyle, marginTop: '20px'}}>
        {isEditMode ? 'Update Template' : 'Create Template'}
      </button>
    </form>
  );
};

export default EmailTemplateForm;
