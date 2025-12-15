import { API_URL } from './config';

export const fetchQuestions = async () => {
  try {
    // 1. Get the token from browser storage (Instant, no await needed)
    const token = localStorage.getItem('authToken');

    if (!token) {
      console.error('No token found. User is not logged in.');
      return { questions: [] };
    }

    // 2. Make the request
    const response = await fetch(`${API_URL}/api/furniture/1/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 3. Attach the token here
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Optional: If token is invalid (401), force logout
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { questions: data.flashcards };
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return { questions: [] };
  }
};
