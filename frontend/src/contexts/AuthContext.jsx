import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi, setToken, getToken, isLoggedIn } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  // bootstrapping

  // On mount, try to rehydrate from stored token
  useEffect(() => {
    if (isLoggedIn()) {
      authApi.me()
        .then(setUser)
        .catch(() => { setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const signup = useCallback(async (email, password, displayName) => {
    // Backend sirf OTP bhejta hai, token nahi deta abhi
    const data = await authApi.signup(email, password, displayName);
    return data; // { message: 'OTP sent' }
  }, []);

  const verifyOtp = useCallback(async (email, otp, password, displayName) => {
    const data = await authApi.verifyOtp(email, otp, password, displayName);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!isLoggedIn()) return;
    const u = await authApi.me();
    setUser(u);
    return u;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, verifyOtp, logout, refreshUser, isLoggedIn: Boolean(user || isLoggedIn()) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}