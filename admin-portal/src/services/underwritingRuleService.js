import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3004/api/v1';

// Helper to get the token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken'); // Assuming token is stored with key 'adminToken'
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Creates a new underwriting rule for a product
export const createUnderwritingRule = async (productId, ruleData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/products/${productId}/underwritingrules`,
      ruleData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating underwriting rule:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to create underwriting rule');
  }
};

// Gets all underwriting rules for a specific product
export const getUnderwritingRulesForProduct = async (productId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/products/${productId}/underwritingrules`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching underwriting rules for product:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch underwriting rules');
  }
};

// Gets a single underwriting rule by its ID
export const getUnderwritingRuleById = async (ruleId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/underwritingrules/${ruleId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching underwriting rule by ID:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch underwriting rule');
  }
};

// Updates an underwriting rule
export const updateUnderwritingRule = async (ruleId, ruleData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/underwritingrules/${ruleId}`,
      ruleData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating underwriting rule:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update underwriting rule');
  }
};

// Deletes an underwriting rule
export const deleteUnderwritingRule = async (ruleId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/underwritingrules/${ruleId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting underwriting rule:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to delete underwriting rule');
  }
};
