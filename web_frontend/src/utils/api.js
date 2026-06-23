import axios from 'axios';

// 1. Prioritize Environment Variable (for Vercel/Production)
// 2. Fallback to the current window origin if it's not localhost (useful for self-hosting)
// 3. Finally fallback to the development ngrok tunnel
const getBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // If hosted on a domain, assume backend is at the same origin or set via ENV
    return window.location.origin;
  }
  return 'https://1d65-20-192-21-54.ngrok-free.app';
};

export const API_BASE_URL = getBaseUrl();

export const callApi = async (action, data = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/v1/web`, { action, data }, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    return { success: false, message: "NETWORK_ERROR" };
  }
};
