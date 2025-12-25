// API configuration and utilities for the Snooker Management System

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// API endpoints
const ENDPOINTS = {
  // Authentication
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
  REGISTER: "/auth/register",

  // Tables
  TABLES: "/tables",
  TABLE_BY_ID: (id) => `/tables/${id}`,

  // Games
  GAMES: "/games",
  GAME_BY_ID: (id) => `/games/${id}`,
  START_GAME: "/games/start",
  END_GAME: (id) => `/games/${id}/end`,
  UPDATE_SCORE: (id) => `/games/${id}/score`,

  // Reservations
  RESERVATIONS: "/reservations",
  RESERVATION_BY_ID: (id) => `/reservations/${id}`,
  AUTOASSIGN: "/reservations/autoassign",

  // Active Tables
  ACTIVE_TABLES: "/activeTables",
  START_SESSION: "/activeTables/start",
  STOP_SESSION: "/activeTables/stop",

  // Queue
  QUEUE: "/queue",
  QUEUE_NEXT: "/queue/next",
  QUEUE_CLEAR: "/queue/clear",

  // Menu
  MENU: "/menu",
  MENU_BY_ID: (id) => `/menu/${id}`,

  // Food
  FOOD: "/food",
  FOOD_BY_ID: (id) => `/food/${id}`,

  // Orders
  ORDERS: "/orders",
  ORDER_BY_ID: (id) => `/orders/${id}`,

  // Billing
  BILLS: "/bills",
  BILL_BY_ID: (id) => `/bills/${id}`,
  BILL_PAY: (id) => `/bills/${id}/pay`,

  // Users
  USERS: "/users",
  USER_BY_ID: (id) => `/users/${id}`,

  // Customers
  CUSTOMERS: "/customer",
  CUSTOMER_BY_ID: (id) => `/customer/${id}`,

  // Wallets
  WALLETS: "/wallets",
  WALLET_BY_ID: (id) => `/wallets/${id}`,

  // Health
  HEALTH: "/health",

  // Stock Images
  STOCK_IMAGES_GAMES: "/stock-images/games",
};

// Image base URL for constructing full image URLs
export const IMAGE_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:4000";

// Request interceptor to add auth token
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Function to clear auth data and redirect to login
const handleAuthError = () => {
  // Clear all auth-related data from localStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userData");

  // Redirect to login page
  // Using window.location instead of navigate because this is outside React
  window.location.href = "/login";
};

// Generic request handler
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const defaultOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 Unauthorized - token is invalid or expired
    if (response.status === 401) {
      console.warn("Authentication failed: Token is invalid or expired");
      handleAuthError();
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return response;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: (email, password) =>
    apiRequest(ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (userData) =>
    apiRequest(ENDPOINTS.REGISTER, {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  logout: () => apiRequest(ENDPOINTS.LOGOUT, { method: "POST" }),

  refreshToken: () => apiRequest(ENDPOINTS.REFRESH, { method: "POST" }),
};

// Tables API
export const tablesAPI = {
  getAll: () => apiRequest(ENDPOINTS.TABLES),

  getById: (id) => apiRequest(ENDPOINTS.TABLE_BY_ID(id)),

  create: (tableData) =>
    apiRequest(ENDPOINTS.TABLES, {
      method: "POST",
      body: JSON.stringify(tableData),
    }),

  update: (id, tableData) =>
    apiRequest(ENDPOINTS.TABLE_BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(tableData),
    }),

  delete: (id) => apiRequest(ENDPOINTS.TABLE_BY_ID(id), { method: "DELETE" }),
};

// Games API
export const gamesAPI = {
  getAll: () => apiRequest(ENDPOINTS.GAMES),

  getById: (id) => apiRequest(ENDPOINTS.GAME_BY_ID(id)),

  create: (gameData) =>
    apiRequest(ENDPOINTS.GAMES, {
      method: "POST",
      body: JSON.stringify(gameData),
    }),

  update: (id, gameData) =>
    apiRequest(ENDPOINTS.GAME_BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(gameData),
    }),

  delete: (id) => apiRequest(ENDPOINTS.GAME_BY_ID(id), { method: "DELETE" }),

  start: (gameData) =>
    apiRequest(ENDPOINTS.START_GAME, {
      method: "POST",
      body: JSON.stringify(gameData),
    }),

  end: (id) => apiRequest(ENDPOINTS.END_GAME(id), { method: "POST" }),

  updateScore: (id, score1, score2) =>
    apiRequest(ENDPOINTS.UPDATE_SCORE(id), {
      method: "PUT",
      body: JSON.stringify({ score1, score2 }),
    }),
};

// Reservations API
export const reservationsAPI = {
  getAll: () => apiRequest(ENDPOINTS.RESERVATIONS),

  getById: (id) => apiRequest(ENDPOINTS.RESERVATION_BY_ID(id)),

  create: (reservationData) =>
    apiRequest(ENDPOINTS.RESERVATIONS, {
      method: "POST",
      body: JSON.stringify(reservationData),
    }),

  update: (id, reservationData) =>
    apiRequest(ENDPOINTS.RESERVATION_BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(reservationData),
    }),

  delete: (id) => apiRequest(ENDPOINTS.RESERVATION_BY_ID(id), { method: "DELETE" }),

  autoassign: (data) =>
    apiRequest(ENDPOINTS.AUTOASSIGN, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Active Tables API
export const activeTablesAPI = {
  getAll: () => apiRequest(ENDPOINTS.ACTIVE_TABLES),

  getById: (id) => apiRequest(`${ENDPOINTS.ACTIVE_TABLES}/${id}`),

  start: (sessionData) =>
    apiRequest(ENDPOINTS.START_SESSION, {
      method: "POST",
      body: JSON.stringify(sessionData),
    }),

  stop: (sessionData) =>
    apiRequest(ENDPOINTS.STOP_SESSION, {
      method: "POST",
      body: JSON.stringify(sessionData),
    }),

  autoRelease: (sessionData) =>
    apiRequest(`${ENDPOINTS.ACTIVE_TABLES}/auto-release`, {
      method: "POST",
      body: JSON.stringify(sessionData),
    }),
};

// Queue API
export const queueAPI = {
  getAll: () => apiRequest(ENDPOINTS.QUEUE),

  add: (queueData) =>
    apiRequest(ENDPOINTS.QUEUE, {
      method: "POST",
      body: JSON.stringify(queueData),
    }),

  next: () => apiRequest(ENDPOINTS.QUEUE_NEXT, { method: "POST" }),

  clear: () => apiRequest(ENDPOINTS.QUEUE_CLEAR, { method: "POST" }),
};

// Menu API
export const menuAPI = {
  getAll: () => apiRequest(ENDPOINTS.MENU),

  getById: (id) => apiRequest(ENDPOINTS.MENU_BY_ID(id)),

  create: (menuData) =>
    apiRequest(ENDPOINTS.MENU, {
      method: "POST",
      body: JSON.stringify(menuData),
    }),

  update: (id, menuData) =>
    apiRequest(ENDPOINTS.MENU_BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(menuData),
    }),

  delete: (id) => apiRequest(ENDPOINTS.MENU_BY_ID(id), { method: "DELETE" }),
};

// Food API
export const foodAPI = {
  getAll: () => apiRequest(ENDPOINTS.FOOD),

  getById: (id) => apiRequest(ENDPOINTS.FOOD_BY_ID(id)),

  create: (foodData) =>
    apiRequest(ENDPOINTS.FOOD, {
      method: "POST",
      body: JSON.stringify(foodData),
    }),

  update: (id, foodData) =>
    apiRequest(ENDPOINTS.FOOD_BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(foodData),
    }),

  delete: (id) => apiRequest(ENDPOINTS.FOOD_BY_ID(id), { method: "DELETE" }),
};

// Orders API
export const ordersAPI = {
  getAll: () => apiRequest(ENDPOINTS.ORDERS),

  getById: (id) => apiRequest(ENDPOINTS.ORDER_BY_ID(id)),

  create: (orderData) =>
    apiRequest(ENDPOINTS.ORDERS, {
      method: "POST",
      body: JSON.stringify(orderData),
    }),

  update: (id, orderData) =>
    apiRequest(ENDPOINTS.ORDER_BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(orderData),
    }),

  updateStatus: (id, status) =>
    apiRequest(`${ENDPOINTS.ORDER_BY_ID(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  delete: (id) => apiRequest(ENDPOINTS.ORDER_BY_ID(id), { method: "DELETE" }),
};

// Billing API
export const billingAPI = {
  getAll: () => apiRequest(ENDPOINTS.BILLS),

  getById: (id) => apiRequest(ENDPOINTS.BILL_BY_ID(id)),

  create: (billData) =>
    apiRequest(`${ENDPOINTS.BILLS}/create`, {
      method: "POST",
      body: JSON.stringify(billData),
    }),

  pay: (id, paymentData) =>
    apiRequest(ENDPOINTS.BILL_PAY(id), {
      method: "POST",
      body: JSON.stringify(paymentData),
    }),

  update: (id, billData) =>
    apiRequest(ENDPOINTS.BILL_BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(billData),
    }),
};

// Users API
export const usersAPI = {
  getAll: () => apiRequest(ENDPOINTS.USERS),

  getById: (id) => apiRequest(ENDPOINTS.USER_BY_ID(id)),

  create: (userData) =>
    apiRequest(ENDPOINTS.USERS, {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  update: (id, userData) =>
    apiRequest(ENDPOINTS.USER_BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(userData),
    }),

  delete: (id) => apiRequest(ENDPOINTS.USER_BY_ID(id), { method: "DELETE" }),
};

// Customers API
export const customersAPI = {
  getAll: () => apiRequest(ENDPOINTS.CUSTOMERS),

  getById: (id) => apiRequest(ENDPOINTS.CUSTOMER_BY_ID(id)),

  create: (customerData) =>
    apiRequest(ENDPOINTS.CUSTOMERS, {
      method: "POST",
      body: JSON.stringify(customerData),
    }),

  update: (id, customerData) =>
    apiRequest(ENDPOINTS.CUSTOMER_BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(customerData),
    }),

  delete: (id) => apiRequest(ENDPOINTS.CUSTOMER_BY_ID(id), { method: "DELETE" }),
};

// Wallets API
export const walletsAPI = {
  getAll: () => apiRequest(ENDPOINTS.WALLETS),

  getById: (id) => apiRequest(ENDPOINTS.WALLET_BY_ID(id)),

  create: (walletData) =>
    apiRequest(ENDPOINTS.WALLETS, {
      method: "POST",
      body: JSON.stringify(walletData),
    }),

  update: (id, walletData) =>
    apiRequest(ENDPOINTS.WALLET_BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(walletData),
    }),
};

// Health API
export const healthAPI = {
  check: () => apiRequest(ENDPOINTS.HEALTH),
};

// Stock Images API
export const stockImagesAPI = {
  getGameImages: () => apiRequest(ENDPOINTS.STOCK_IMAGES_GAMES),
};

// Helper to build full image URL from image_key
export const getGameImageUrl = (imageKey) => {
  if (!imageKey) return null;
  return `${IMAGE_BASE_URL}/static/game-images/${encodeURIComponent(imageKey)}`;
};

// Export default API object
const api = {
  auth: authAPI,
  tables: tablesAPI,
  games: gamesAPI,
  reservations: reservationsAPI,
  activeTables: activeTablesAPI,
  queue: queueAPI,
  menu: menuAPI,
  food: foodAPI,
  orders: ordersAPI,
  billing: billingAPI,
  users: usersAPI,
  customers: customersAPI,
  wallets: walletsAPI,
  health: healthAPI,
  stockImages: stockImagesAPI,
};

export default api;
