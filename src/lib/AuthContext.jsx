import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '@/api/mongoApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      setIsLoadingAuth(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authApi.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (credentials) => {
    try {
      const data = await authApi.login(credentials);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      setAuthError(null);
      return data.user;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const register = async (data) => {
    try {
      const result = await authApi.register(data);
      localStorage.setItem('token', result.token);
      setUser(result.user);
      setIsAuthenticated(true);
      setAuthError(null);
      return result.user;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (data) => {
    try {
      const updatedUser = await authApi.updateProfile(data);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
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
      authError,
      login,
      register,
      logout,
      updateProfile,
      checkAuth,
      navigateToLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

