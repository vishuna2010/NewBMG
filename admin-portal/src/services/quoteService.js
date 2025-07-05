// admin-portal/src/services/quoteService.js

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

// Create a new quote
export const createQuote = async (quoteData) => {
  const response = await fetch(`${API_BASE_URL}/quotes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(quoteData),
  });
  return handleResponse(response);
};

// Get all quotes (admin view, supports query params for filtering)
export const getAllQuotes = async (queryParams = {}) => {
  const queryString = new URLSearchParams(queryParams).toString();
  const response = await fetch(`${API_BASE_URL}/quotes?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
};

// Get a single quote by its ID
export const getQuoteById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/quotes/${id}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
};

// Update a quote's status (e.g., 'Expired', 'Rejected' by admin)
// Note: 'Accepted' might trigger policy creation flow, handled separately or via this.
export const updateQuoteStatus = async (id, statusUpdateData) => { // statusUpdateData could be { status: 'newStatus', notes: '...' }
  const response = await fetch(`${API_BASE_URL}/quotes/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(statusUpdateData), // Send as { "status": "NewStatus" }
  });
  return handleResponse(response);
};

// Get all versions of a quote
export const getAllVersions = async (id) => {
  const response = await fetch(`${API_BASE_URL}/quotes/${id}/versions`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
};

// Create a new version of a quote
export const createNewVersion = async (id, changes = '') => {
  const response = await fetch(`${API_BASE_URL}/quotes/${id}/versions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ changes }),
  });
  return handleResponse(response);
};

// Optional: Delete a quote (if admins can delete quotes, e.g., old drafts)
// export const deleteQuote = async (id) => {
//   // const token = getToken(); // Token will be used when auth is wired up
//   const response = await fetch(`${API_BASE_URL}/quotes/${id}`, {
//     method: 'DELETE',
//     headers: {
//       // 'Authorization': `Bearer ${token}`,
//     },
//   });
//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({ message: response.statusText }));
//     throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//   }
//   return { success: true, message: 'Quote deleted successfully' };
// };

// Generate PDF for a quote and get its S3 URL
export const generateQuotePdf = async (id) => {
  const response = await fetch(`${API_BASE_URL}/quotes/${id}/generate-pdf`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response); // Expected response: { success: true, message: '...', data: { quotePdfUrl: '...' } }
};
