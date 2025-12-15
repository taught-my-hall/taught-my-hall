import { API_URL } from './config';

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/api/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email, // Mapping the arguments to the backend expectations
      password: password,
    }),
  });

  if (!response.ok) {
    // We throw an error here so the UI knows something went wrong
    throw new Error(`Login failed with status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};
