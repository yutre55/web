import axios from 'axios';

const getBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'https://web-jo90.onrender.com';
  }

  return 'https://web-jo90.onrender.com';
};

export const API_BASE_URL = getBaseUrl();

export const pingServer = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/ping`);
    return response.ok;
  } catch {
    return false;
  }
};

export const callApi = async (action, data = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/web`, { action, data });
    return response.data;
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    return { success: false, message: "NETWORK_ERROR" };
  }
};
