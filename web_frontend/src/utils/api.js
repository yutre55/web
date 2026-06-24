import axios from 'axios';

// 1. Prioritize Environment Variable (for Vercel/Production)
// 2. Fallback to the current window origin if it's not localhost (useful for self-hosting)
// 3. Finally fallback to the development ngrok tunnel
const getBaseUrl = () => {
  // If we have an environment variable, use it (highest priority)
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;

  // If we are running locally, we might want to use a local or specific dev URL
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'https://web-jo90.onrender.com';
  }

  // For Vercel or any other production deployment, use the Render backend URL
  // Do NOT use window.location.origin because the backend is on Render, not Vercel.
  return 'https://web-jo90.onrender.com';
};

export const API_BASE_URL = getBaseUrl();

export const callApi = async (action, data = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/web`, { action, data });
    return response.data;
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    return { success: false, message: "NETWORK_ERROR" };
  }
};
