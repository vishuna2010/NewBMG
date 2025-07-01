// frontend/src/services/authService.js

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3004/api/v1'; // Ensure this matches your backend port

// Placeholder for actual token storage and retrieval (e.g., localStorage, Context API, Redux)
const getToken = () => {
  // For testing, you might hardcode a token known to be valid for a 'customer' role user
  // return 'YOUR_HARDCODED_JWT_TOKEN_FOR_A_CUSTOMER_USER';
  // In a real app:
  // return localStorage.getItem('userToken');
  console.warn("authService (frontend): getToken() is a placeholder. Real token management needed for authenticated calls.");
  return null; // This will likely cause protected API calls to fail if backend expects a real token
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, use statusText
      errorData = { message: response.statusText, errors: [{ msg: response.statusText }] };
    }
    // Use errorData.error if available (from our backend structure), then errorData.message, then array of errors
    const message = errorData.error || errorData.message || (errorData.errors && errorData.errors.map(e => e.msg).join(', '));
    throw new Error(message || `HTTP error! status: ${response.status}`);
  }
  // Handle cases where response might be empty (e.g., 204 No Content)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  return { success: true }; // For non-JSON success responses like 204
};


// --- Authentication Related ---

export const loginUser = async (credentials) => { // { email, password }
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await handleResponse(response);
  // TODO: if (data.success && data.token) { localStorage.setItem('userToken', data.token); }
  return data;
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await handleResponse(response);
  // TODO: if (data.success && data.token) { localStorage.setItem('userToken', data.token); }
  return data;
};


// --- User Profile Related (for the logged-in user) ---

export const getLoggedInUserProfile = async () => {
  const token = getToken();
  if (!token) {
    // To avoid making an API call that will surely fail without a token.
    // In a real app, this might redirect to login or be handled by an auth context.
    throw new Error('Not authenticated. No token found.');
  }
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const updateUserProfile = async (profileData) => {
  const token = getToken();
   if (!token) {
    throw new Error('Not authenticated. No token found.');
  }
  const response = await fetch(`${API_BASE_URL}/users/profile`, { // Note: Backend route is /api/v1/users/profile
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  return handleResponse(response);
};

// TODO: Add changePassword service function if there's a dedicated backend endpoint
// export const changePassword = async (passwordData) => { ... }
