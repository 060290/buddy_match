import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = (email, password) =>
    api.post('/auth/login', { email, password }).then((res) => {
      setUser(res.data.user);
      return res.data;
    });

  const register = (data) =>
    api.post('/auth/register', data).then((res) => {
      setUser(res.data.user);
      return res.data;
    });

  const logout = () =>
    api.post('/auth/logout').then(() => setUser(null)).catch(() => setUser(null));

  const refreshMe = () =>
    api.get('/auth/me').then((res) => setUser(res.data));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
