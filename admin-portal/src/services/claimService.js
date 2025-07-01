// admin-portal/src/services/claimService.js

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3004/api/v1';

// Placeholder for getting the auth token
const getToken = () => {
  // return localStorage.getItem('adminToken');
  console.warn("claimService: getToken() is a placeholder. Real token management needed.");
  return null;
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
    return { success: true }; // Indicate success for no-content responses
  }
  return response.json();
};

// Get all claims (admin view, supports query params for filtering)
export const getAllClaims = async (queryParams = {}) => {
  // const token = getToken(); // Token will be used when auth is wired up
  const queryString = new URLSearchParams(queryParams).toString();
  const response = await fetch(`${API_BASE_URL}/claims?${queryString}`, {
    headers: {
      // 'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Get a single claim by its ID
export const getClaimById = async (id) => {
  // const token = getToken();
  const response = await fetch(`${API_BASE_URL}/claims/${id}`, {
    headers: {
      // 'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Update a claim's status
export const updateClaimStatus = async (id, statusUpdateData) => { // e.g., { status: 'UnderReview', note: 'Initial review complete' }
  // const token = getToken();
  const response = await fetch(`${API_BASE_URL}/claims/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(statusUpdateData),
  });
  return handleResponse(response);
};

// Assign an adjuster to a claim
export const assignClaimToAdjuster = async (id, assignmentData) => { // e.g., { adjusterId: 'someUserId', note: 'Assigned to John Doe' }
  // const token = getToken();
  const response = await fetch(`${API_BASE_URL}/claims/${id}/assign`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(assignmentData),
  });
  return handleResponse(response);
};

// Add a note to a claim
export const addClaimNote = async (id, noteData) => { // e.g., { note: 'Customer called with update.' } - authorName will be set by backend from token
  // const token = getToken();
  const response = await fetch(`${API_BASE_URL}/claims/${id}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(noteData),
  });
  return handleResponse(response);
};

// Add an attachment to a claim (placeholder - assumes URL is pre-generated or file handled by other means)
// For actual file upload from frontend, this would be more complex (e.g., using FormData)
export const addClaimAttachment = async (id, attachmentData) => { // e.g., { fileName: 'photo.jpg', fileUrl: 's3_or_other_url', fileType: 'image/jpeg', description: 'Photo of damage' }
  // const token = getToken();
  const response = await fetch(`${API_BASE_URL}/claims/${id}/attachments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(attachmentData),
  });
  return handleResponse(response);
};

// Optional: If admin needs to delete a claim (use with caution)
// export const deleteClaim = async (id) => { ... }
