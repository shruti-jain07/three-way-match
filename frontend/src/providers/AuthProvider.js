"use client";
 
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, getStoredToken, setStoredToken } from "@/lib/apiClient";
 
const AuthContext = createContext(null);
 
export default function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
 
  useEffect(() => {
    setToken(getStoredToken());
    setIsLoading(false);
  }, []);
 
  const login = useCallback(async () => {
    const response = await apiClient.post("/auth/login", {});
    setStoredToken(response.token);
    setToken(response.token);
    return response.token;
  }, []);
 
  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    router.push("/login");
  }, [router]);
 
  const value = {
    token,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    logout,
  };
 
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
 
export const useAuth = () => {
  const context = useContext(AuthContext);
 
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
 
  return context;
};