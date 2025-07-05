// admin-portal/src/services/policyService.js

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
    throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
  }
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return null;
  }
  return response.json();
};

// Get all policies (admin/agent view, supports query params for filtering)
export const getAllPolicies = async (queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();
  const response = await fetch(`${API_BASE_URL}/policies?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
};

// Get a single policy by its ID
export const getPolicyById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/policies/${id}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
};

// Update a policy (e.g., status, documents, notes)
export const updatePolicy = async (id, policyData) => {
  const response = await fetch(`${API_BASE_URL}/policies/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(policyData),
  });
  return handleResponse(response);
};

// "Delete" a policy (soft delete / cancel)
export const deletePolicy = async (id) => {
  const response = await fetch(`${API_BASE_URL}/policies/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }
    throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
  }
  if (response.status === 204) return { success: true, message: 'Policy cancelled/deleted successfully' };
  return response.json();
};

// Create a policy from an accepted quote
export const createPolicyFromQuote = async (quoteId) => {
  const response = await fetch(`${API_BASE_URL}/policies/from-quote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ quoteId }),
  });
  return handleResponse(response);
};
