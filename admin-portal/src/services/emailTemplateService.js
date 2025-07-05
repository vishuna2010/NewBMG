// admin-portal/src/services/emailTemplateService.js

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3004/api/v1';

const getToken = () => localStorage.getItem('adminToken');

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }
    throw new Error(errorData.error || errorData.message || (errorData.errors && errorData.errors.map(err => err.msg).join(', ')) || `HTTP error! status: ${response.status}`);
  }
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return { success: true }; // Indicate success for no-content responses like DELETE
  }
  return response.json();
};

// Get all email templates
export const getAllEmailTemplates = async (queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();
  const response = await fetch(`${API_BASE_URL}/email-templates?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
};

// Get a single email template by its ID or templateName
export const getEmailTemplate = async (identifier) => {
  const response = await fetch(`${API_BASE_URL}/email-templates/${identifier}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
};

// Create a new email template
export const createEmailTemplate = async (templateData) => {
  const response = await fetch(`${API_BASE_URL}/email-templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(templateData),
  });
  return handleResponse(response);
};

// Update an email template by its ID or templateName
export const updateEmailTemplate = async (identifier, templateData) => {
  // const token = getToken();
  const response = await fetch(`${API_BASE_URL}/email-templates/${identifier}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(templateData),
  });
  return handleResponse(response);
};

// Delete an email template by its ID or templateName
export const deleteEmailTemplate = async (identifier) => {
  // const token = getToken();
  const response = await fetch(`${API_BASE_URL}/email-templates/${identifier}`, {
    method: 'DELETE',
    headers: {
      // 'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response); // Expects 200 with data or 204
};
