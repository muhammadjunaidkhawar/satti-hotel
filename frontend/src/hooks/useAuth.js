import { useState, useEffect } from 'react';
import { isAuthenticated, getToken, removeToken, setToken } from '../utils/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check authentication status on mount
    const token = getToken();
    setAuthState({
      isAuthenticated: !!token,
      isLoading: false,
    });
  }, []);

  const login = (token) => {
    setToken(token);
    setAuthState({
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    removeToken();
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    logout,
  };
};
