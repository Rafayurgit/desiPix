// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import { signIn as apiSignIn, signUp as apiSignUp, refresh as apiRefresh, logOut as apiLogOut, changePassword as apiChangePassword} from "../services/authService";
import { isTokenExpired, parseUserFromToken } from "../utils/jwtHelpers";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setTokenInMemory = useCallback((token) => {
    setAccessToken(token);
    window.__ACCESS_TOKEN__ = token;

    const parsed = parseUserFromToken(token);
    setUser(parsed ? { id: parsed.sub, email: parsed.email, ...parsed } : null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { data } = await apiRefresh();
      setTokenInMemory(data.accessToken);
      return true;
    } catch {
      setTokenInMemory(null);
      return false;
    }
  }, [setTokenInMemory]);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const signIn = async (credentials) => {
    if(isTokenExpired(accessToken)){
        await refresh()
    }
    const { data } = await apiSignIn(credentials.email, credentials.password);
    setTokenInMemory(data.accessToken);
    return data;
  };

  const signUp = async (payload) => {
    await apiSignUp(payload);
    return await signIn({ email: payload.email, password: payload.password });
  };

  const signOut = async () => {
    await apiLogOut();
    setTokenInMemory(null);
  };

  const changePassword = async (payload) => {
  await apiChangePassword(payload);
};


  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        signIn,
        signUp,
        signOut,
        refresh,
        setTokenInMemory,
        changePassword,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}