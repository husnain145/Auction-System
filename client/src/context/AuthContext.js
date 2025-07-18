import axios from 'axios';
import { createContext, useState, useEffect } from 'react';
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const login = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

   const loginWithGoogle = async (tokenId) => {
    const res = await axios.post('http://localhost:5000/api/auth/google', { tokenId });
    const token = res.data.token;
    localStorage.setItem('token', token);
    setToken(token);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
