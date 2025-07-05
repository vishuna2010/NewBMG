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

export const calculatePremium = async (quoteData) => {
  const response = await fetch(`${API_BASE_URL}/premium/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(quoteData),
  });
  return handleResponse(response);
};

export const getRatingFactors = async (productType) => {
  const response = await fetch(`${API_BASE_URL}/rating-factors?productType=${productType}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
};

export const getRateTables = async (productType) => {
  const response = await fetch(`${API_BASE_URL}/rate-tables?productType=${productType}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return handleResponse(response);
}; 