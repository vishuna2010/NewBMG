// admin-portal/src/services/productService.js

// Assuming the backend runs on port 3004 during development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3004/api/v1';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  // If response is "204 No Content" or similar where .json() would fail
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return null; // Or return { success: true } or similar as appropriate for the call
  }
  return response.json();
};

export const getAllProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  return handleResponse(response);
};

export const getProductById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`);
  return handleResponse(response);
};

export const createProduct = async (productData) => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // TODO: Add Authorization header if/when auth is implemented
      // 'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(productData),
  });
  return handleResponse(response);
};

export const updateProduct = async (id, productData) => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // TODO: Add Authorization header
    },
    body: JSON.stringify(productData),
  });
  return handleResponse(response);
};

export const deleteProduct = async (id) => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: {
      // TODO: Add Authorization header
    },
  });
  // For DELETE, a 200 OK with empty body or 204 No Content is common.
  // handleResponse might need adjustment if it strictly expects JSON.
  // For now, let's assume if it's not an error, it's successful.
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return { success: true, message: 'Product deleted successfully' }; // Or simply return response if status is enough
};
