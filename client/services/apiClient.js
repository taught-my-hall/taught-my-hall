import { API_URL } from './config';

export const apiClient = async (
  endpoint,
  { method, body, ...customOptions } = {}
) => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      console.error('No token found. User is not logged in.');
      throw new Error('Unauthorized');
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...customOptions.headers,
    };

    const config = {
      method,
      headers,
      ...customOptions,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    console.log(config);

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    // Return the parsed JSON
    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error; // Re-throw so the calling function handles the specific UI state
  }
};
