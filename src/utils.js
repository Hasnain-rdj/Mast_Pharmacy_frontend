// Helper function to get user data from storage
export const getStoredUser = () => {
  try {
    // Check localStorage first for remembered user
    const localUser = localStorage.getItem('user');
    if (localUser) {
      const user = JSON.parse(localUser);
      // Check if token is expired for remembered users
      const expiry = localStorage.getItem('expiry');
      if (expiry && Date.now() > parseInt(expiry)) {
        // Clear expired data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('expiry');
        return null;
      }
      return user;
    }
    
    // Then check sessionStorage for session-only user
    const sessionUser = sessionStorage.getItem('user');
    return sessionUser ? JSON.parse(sessionUser) : null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

// Helper function to get auth token
export const getStoredToken = () => {
  // Check localStorage first
  const localToken = localStorage.getItem('token');
  if (localToken) {
    // Check expiry for remembered tokens
    const expiry = localStorage.getItem('expiry');
    if (!expiry || Date.now() <= parseInt(expiry)) {
      return localToken;
    }
    // Clear expired data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('expiry');
  }
  
  // Then check sessionStorage
  return sessionStorage.getItem('token');
};
