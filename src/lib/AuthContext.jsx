import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabaseAPI } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        const currentUser = await localAPI.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoadingAuth(false);
      setIsLoadingPublicSettings(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await localAPI.login({ username, password });
      const { user, token } = response;
      
      localStorage.setItem('auth_token', token);
      setUser(user);
      setIsAuthenticated(true);
      setAuthError(null);
      
      return { success: true };
    } catch (error) {
      setAuthError({
        type: 'login_failed',
        message: 'Invalid credentials'
      });
      return { success: false, error };
    }
  };

  const logout = (shouldRedirect = true) => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
    
    if (shouldRedirect) {
      window.location.href = '/login';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      logout,
      navigateToLogin,
      login,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
