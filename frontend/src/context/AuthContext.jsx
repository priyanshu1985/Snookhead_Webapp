import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing authentication on app start
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // For now, we'll simulate password validation
      if (!password) {
        throw new Error("Password is required");
      }

      const mockResponse = {
        token: "mock-jwt-token",
        user: {
          id: 1,
          name: "Admin User",
          email: email,
          role: "admin",
        },
      };

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      localStorage.setItem("authToken", mockResponse.token);
      localStorage.setItem("userData", JSON.stringify(mockResponse.user));

      setUser(mockResponse.user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // For now, we'll simulate password validation
      if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      const mockResponse = {
        token: "mock-jwt-token",
        user: {
          id: Date.now(),
          name: name,
          email: email,
          role: "user",
        },
      };

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      localStorage.setItem("authToken", mockResponse.token);
      localStorage.setItem("userData", JSON.stringify(mockResponse.user));

      setUser(mockResponse.user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Register error:", error);
      throw new Error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem("userData", JSON.stringify(updatedUser));
  };

  const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };

  const value = {
    user,
    isAuthenticated,
    loading: isLoading,
    login,
    register,
    logout,
    updateUser,
    getAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
