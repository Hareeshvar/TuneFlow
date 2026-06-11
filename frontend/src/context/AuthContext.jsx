import React, { createContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export const AuthContext = createContext();

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp) {
      return Date.now() >= payload.exp * 1000;
    }
    return false;
  } catch (e) {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSessionExpired = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setToken(null);
    setRole(null);
    setUsername(null);
    alert("Session expired. Please login again.");
  };

  // Check token expiration on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedUsername = localStorage.getItem('username');

    if (storedToken) {
      if (isTokenExpired(storedToken)) {
        handleSessionExpired();
      } else {
        setToken(storedToken);
        setRole(storedRole);
        setUsername(storedUsername);
      }
    }
    setLoading(false);
  }, []);

  // Periodic check for token expiration
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      if (isTokenExpired(token)) {
        handleSessionExpired();
      }
    }, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [token]);

  const login = async (user, pass) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: user, password: pass }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.username);
      setToken(data.token);
      setRole(data.role);
      setUsername(data.username);
      return { success: true };
    } else {
      let errorMessage = "Invalid username or password";
      try {
        const errorData = await response.json();
        if (errorData.message) errorMessage = errorData.message;
      } catch (e) {
        // use default error message
      }
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setToken(null);
    setRole(null);
    setUsername(null);
  };

  const isAdmin = () => {
    return role === 'ADMIN' && token && !isTokenExpired(token);
  };

  return (
    <AuthContext.Provider value={{ token, role, username, login, logout, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
