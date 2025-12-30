import { createContext, useState, useEffect, useContext } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Only for initial app load
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
        localStorage.removeItem("refreshToken");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    // Don't set isLoading here - it causes the Login component to unmount!
    // The login page has its own isLoading state for the button
    try {
      const response = await authAPI.login(email, password);

      // Store tokens
      localStorage.setItem("authToken", response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }

      // Store user data
      const userData = response.user || { email };
      localStorage.setItem("userData", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      throw error; // Re-throw the original error to preserve the message
    }
  };

  const register = async (userData) => {
    // Don't set isLoading here - it causes the Register component to unmount!
    // The register page has its own isLoading state for the button
    try {
      const response = await authAPI.register(userData);

      // Store tokens
      localStorage.setItem("authToken", response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }

      // Store user data from response
      const user = response.user || { name: userData.name, email: userData.email, role: userData.role };
      localStorage.setItem("userData", JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (error) {
      console.error("Register error:", error);
      throw error; // Re-throw original error to preserve the message
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("refreshToken");
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
