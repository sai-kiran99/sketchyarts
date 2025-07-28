import React, { createContext, useEffect, useState } from 'react';
//import axios from 'axios';
import axios from '../axiosInstance';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setUserEmail(null);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setUserEmail(res.data.email);
    } catch (err) {
      console.error('❌ Failed to fetch user:', err.message);
      setUser(null);
      setUserEmail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email) => {
    localStorage.setItem('userEmail', email);
    setUserEmail(email);
    await fetchProfile(); // ✅ force refresh user after login
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setUser(null);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider value={{ user, userEmail, loading, login, logout, refreshUser: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
