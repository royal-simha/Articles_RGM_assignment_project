import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ApiClient from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = ApiClient.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await ApiClient.getCurrentUser();
      if (res && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
        ApiClient.setToken(null);
      }
    } catch {
      setUser(null);
      ApiClient.setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    const res = await ApiClient.login({ email, password });
    if (res.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const register = async ({ name, email, password, role }) => {
    const res = await ApiClient.register({ name, email, password, role });
    if (res.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const logout = async () => {
    await ApiClient.logout();
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const res = await ApiClient.updateProfile(payload);
    if (res.data?.user) {
      setUser((prev) => ({ ...prev, ...res.data.user }));
    }
    return res;
  };

  const isAuthenticated = !!user;
  const isReader = user?.role === 'reader' || user?.role === 'creator' || user?.role === 'admin';
  const isCreator = user?.role === 'creator' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isReader,
        isCreator,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
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
