// admin-portal/src/services/authService.js

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3004/api/v1';

const handleAuthResponse = async (response) => {
  const responseData = await response.json();
  if (!response.ok) {
    // Use error message from backend if available, otherwise default
    const error = (responseData && responseData.error) || response.statusText || `HTTP error! status: ${response.status}`;
    throw new Error(error);
  }
  return responseData; // Expected to contain { success: true, token: '...', data: { user object } }
};

/**
 * Logs in a user.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} - Resolves with login data (token, user details).
 */
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return handleAuthResponse(response);
};

// Placeholder for fetching current user profile if needed separately
// export const getMe = async (token) => {
//   const response = await fetch(`${API_BASE_URL}/auth/me`, {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//     },
//   });
//   return handleAuthResponse(response);
// };

// Placeholder for registration if admin can register other admins (usually not typical)
// export const register = async (userData) => {
//   const response = await fetch(`${API_BASE_URL}/auth/register`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(userData),
//   });
//   return handleAuthResponse(response);
// };

// Note: Logout is typically handled client-side by removing the token
// and clearing auth state, so it might not need a service call unless
// the backend has a token invalidation mechanism.
