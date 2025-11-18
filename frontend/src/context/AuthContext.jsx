import React, { createContext, useState, useEffect, useCallback } from "react";
import {
  signIn as apiSignIn,
  signUp as apiSignUp,
  refresh as apiRefresh,
  logOut as apiLogOut,
  changePassword as apiChangePassword,
} from "../services/authService";
import { parseUserFromToken, isTokenExpired } from "../utils/jwtHelpers";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /** ----------------------------
   *  Helper: Set token + user
   * ---------------------------- */
  const setTokenInMemory = useCallback((token) => {
    setAccessToken(token);
    window.__ACCESS_TOKEN__ = token || null;

    if (token) {
      const parsed = parseUserFromToken(token);
      setUser(parsed ? { id: parsed.sub, email: parsed.email, ...parsed } : null);
    } else {
      setUser(null);
    }
  }, []);

  /** ----------------------------
   *  Refresh Access Token
   * ---------------------------- */
  const refresh = useCallback(async () => {
    try {
      console.log("🌐 Attempting token refresh. Cookies:", document.cookie);
      const { data } = await apiRefresh();
      if (data?.accessToken) {
        console.log("✅ Refresh successful");
        setTokenInMemory(data.accessToken);
        return true;
      } else {
        console.warn("⚠️ Refresh returned no token");
        setTokenInMemory(null);
        return false;
      }
    } catch (err) {
      console.error("❌ Refresh failed", err?.response?.status, err);
      setTokenInMemory(null);
      return false;
    }
  }, [setTokenInMemory]);

  /** ----------------------------
   *  Initial Token Load (on mount)
   * ---------------------------- */
  useEffect(() => {
    let isMounted = true;
    (async () => {
      // Wait briefly for cookies to load
      await new Promise((r) => setTimeout(r, 150));
      const success = await refresh();
      if (isMounted) setLoading(false);
      if (!success) console.warn("Initial refresh failed – user not logged in");
    })();
    return () => (isMounted = false);
  }, [refresh]);

  /** ----------------------------
   *  Sign In / Sign Up / Logout
   * ---------------------------- */
  const signIn = async (credentials) => {
    try {
      console.log("🔑 Signing in...");
      const { data } = await apiSignIn(credentials.email, credentials.password);
      setTokenInMemory(data.accessToken);
      setLoading(false); // ✅ FIX: stop loading after successful login
      console.log("✅ Login success, user set");
      return data;
    } catch (err) {
      console.error("❌ Sign-in failed", err);
      throw err;
    }
  };

  const signUp = async (payload) => {
    await apiSignUp(payload);
    return signIn({ email: payload.email, password: payload.password });
  };

  const signOut = async () => {
    try {
      await apiLogOut();
    } catch (err) {
      console.warn("⚠️ Logout error (probably already logged out)", err);
    } finally {
      setTokenInMemory(null);
      setLoading(false);
    }
  };

  const changePassword = async (payload) => {
    await apiChangePassword(payload);
  };

  /** ----------------------------
   *  Context Provider Value
   * ---------------------------- */
  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        signIn,
        signUp,
        signOut,
        refresh,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
