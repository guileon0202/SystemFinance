// Dentro de Frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useCallback } from 'react'; // useEffect foi removido
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
    // Rota correta
    const response = await api.post('/session', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('@WebFinance:token', token);
    localStorage.setItem('@WebFinance:user', JSON.stringify(user));
    api.defaults.headers.authorization = `Bearer ${token}`;
    setData({ token, user });
  }, []);
  
  const signUp = useCallback(async ({ name, email, password }) => {
    // Rota correta
    await api.post('/users', { name, email, password });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@WebFinance:token');
    localStorage.removeItem('@WebFinance:user');
    setData({});
    api.defaults.headers.authorization = null;
  }, []);

  return (
    <AuthContext.Provider value={{ user: data.user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};