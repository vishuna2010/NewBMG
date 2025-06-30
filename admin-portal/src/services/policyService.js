// admin-portal/src/services/policyService.js

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3004/api/v1';

// Placeholder for getting the auth token
const getToken = () => {
  // return localStorage.getItem('adminToken');
  console.warn("policyService: getToken() is a placeholder. Real token management needed.");
  return null; // This will cause API calls to fail if routes are protected and no valid token is provided.
};

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
  const token = getToken();
  const queryString = new URLSearchParams(queryParams).toString();
  const response = await fetch(`${API_BASE_URL}/policies?${queryString}`, {
    headers: {
      // 'Authorization': `Bearer ${token}`, // Uncomment when auth is fully integrated
    },
  });
  return handleResponse(response);
};

// Get a single policy by its ID
export const getPolicyById = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/policies/${id}`, {
    headers: {
      // 'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Update a policy (e.g., status, documents, notes)
export const updatePolicy = async (id, policyData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/policies/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(policyData),
  });
  return handleResponse(response);
};

// "Delete" a policy (soft delete / cancel)
export const deletePolicy = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/policies/${id}`, {
    method: 'DELETE',
    headers: {
      // 'Authorization': `Bearer ${token}`,
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
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/policies/from-quote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ quoteId }),
  });
  return handleResponse(response);
};
