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

export const getAllRateTables = async () => {
  const response = await fetch(`${API_BASE_URL}/rate-tables`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
};

export const getRateTableById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/rate-tables/${id}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
};

export const createRateTable = async (data) => {
  const response = await fetch(`${API_BASE_URL}/rate-tables`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateRateTable = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/rate-tables/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteRateTable = async (id) => {
  const response = await fetch(`${API_BASE_URL}/rate-tables/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
};

export const getRateTablesByProductType = async (productType) => {
  const response = await fetch(`${API_BASE_URL}/rate-tables/product/${productType}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
}; 