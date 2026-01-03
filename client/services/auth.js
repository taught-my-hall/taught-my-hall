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

  return await response.json();
};

export const registerUser = async (name, email, password) => {
  const response = await fetch(`${API_URL}/api/auth/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      name: name,
      email: email,
      password: password,
    }),
  });

  if (!response.ok) {
    // Attempt to parse the backend error message if available
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.message ||
      `Registration failed with status: ${response.status}`;
    throw new Error(message);
  }

  return await response.json();
};
