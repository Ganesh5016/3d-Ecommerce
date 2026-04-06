import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('luxe_token'),
  isAuthenticated: false,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('luxe_token', action.payload.token);
      if (action.payload.refreshToken) localStorage.setItem('luxe_refresh_token', action.payload.refreshToken);
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, loading: false };
    case 'LOGOUT':
      localStorage.removeItem('luxe_token');
      localStorage.removeItem('luxe_refresh_token');
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('luxe_token');
      if (token) {
        try {
          const { data } = await authAPI.getMe();
          dispatch({ type: 'SET_USER', payload: data.user });
        } catch {
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    dispatch({ type: 'LOGIN_SUCCESS', payload: data });
    return data;
  };

  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    dispatch({ type: 'LOGIN_SUCCESS', payload: data });
    return data;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch {}
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'SET_USER', payload: { ...state.user, ...userData } });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
