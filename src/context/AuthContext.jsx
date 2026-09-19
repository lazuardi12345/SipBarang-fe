import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SESSION_KEY } from "../utils/constants";
import ApiClient from "../api/client";
import { authApi } from "../api/auth";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const token = ApiClient.getToken();
      const rawSession = window.localStorage.getItem(SESSION_KEY);

      if (rawSession) {
        try {
          setUser(JSON.parse(rawSession));
        } catch {
          window.localStorage.removeItem(SESSION_KEY);
        }
      }

      if (token) {
        try {
          const profile = await authApi.getProfile();
          if (profile) {
            setUser(profile);
            window.localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
          }
        } catch (err) {
          console.warn("Session expired or invalid:", err.message);
          ApiClient.setToken(null);
          window.localStorage.removeItem(SESSION_KEY);
          setUser(null);
        }
      }

      setLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    const result = await authApi.login(email, password);
    const safeUser = result.user;
    setUser(safeUser);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
    return safeUser;
  };

  const register = async (input) => {
    await authApi.register(input);
    return login(input.email, input.password);
  };

  const logout = () => {
    ApiClient.setToken(null);
    window.localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
