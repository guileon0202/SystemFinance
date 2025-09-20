import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const token = localStorage.getItem('@WebFinance:token');
    const user = localStorage.getItem('@WebFinance:user');

    if (token && user) {
      api.defaults.headers.authorization = `Bearer ${token}`;
      return { token, user: JSON.parse(user) };
    }

    return {};
  });

  const signIn = useCallback(async ({ email, password }) => {
    const response = await api.post('api/session', { email, password });
    const { token, user } = response.data;

    localStorage.setItem('@WebFinance:token', token);
    localStorage.setItem('@WebFinance:user', JSON.stringify(user));

    api.defaults.headers.authorization = `Bearer ${token}`;

    setData({ token, user });
  }, []);
  
  const signUp = useCallback(async ({ name, email, password }) => {
    await api.post('api/users', { name, email, password });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@WebFinance:token');
    localStorage.removeItem('@WebFinance:user');
    setData({});
  }, []);

  return (
    <AuthContext.Provider value={{ user: data.user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};