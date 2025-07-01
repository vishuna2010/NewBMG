// admin-portal/src/services/userService.js

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3004/api/v1';

// Placeholder for getting the auth token
// In a real app, this would come from your auth context or local storage
// const getToken = () => {
//   // return localStorage.getItem('adminToken');
//   // For now, returning null or a dummy token if you want to test protected routes without full login
//   // This will cause API calls to fail if routes are protected and no valid token is provided.
//   console.warn("userService: getToken() is a placeholder. Real token management needed.");
//   return null;
// };

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

// Admin User Management Functions
export const getAllUsers = async (queryParams = {}) => {
  // const token = getToken(); // Token will be used when auth is wired up
  const queryString = new URLSearchParams(queryParams).toString();
  const response = await fetch(`${API_BASE_URL}/users?${queryString}`, {
    headers: {
      // 'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const getUserById = async (id) => {
  // const token = getToken(); // Token will be used when auth is wired up
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    headers: {
      // 'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const updateUser = async (id, userData) => {
  // const token = getToken(); // Token will be used when auth is wired up
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

// Note: Admin creating users might be handled by a specific endpoint or by using the public /register with a special flag/role.
// For now, we assume admin updates roles/status of existing users.
// If admin can create users directly:
// export const createUserByAdmin = async (userData) => { ... }


export const deleteUser = async (id) => {
  // const token = getToken(); // Token will be used when auth is wired up
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
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
  // DELETE often returns 200 with a success message or 204 No Content
  if (response.status === 204) return { success: true, message: 'User deleted successfully' };
  return response.json(); // If it returns a body like { success: true, data: {} }
};
