// API configuration and utilities for the Snooker Management System

const API_BASE_URL = "http://localhost:3001/api"; // TODO: Configure environment variable

// API endpoints
const ENDPOINTS = {
  // Authentication
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",

  // Tables
  TABLES: "/tables",
  TABLE_BY_ID: (id) => `/tables/${id}`,

  // Games
  GAMES: "/games",
  GAME_BY_ID: (id) => `/games/${id}`,
  START_GAME: "/games/start",
  END_GAME: (id) => `/games/${id}/end`,
  UPDATE_SCORE: (id) => `/games/${id}/score`,

  // Bookings
  BOOKINGS: "/bookings",
  BOOKING_BY_ID: (id) => `/bookings/${id}`,
  CHECK_AVAILABILITY: "/bookings/check-availability",

  // Members
  MEMBERS: "/members",
  MEMBER_BY_ID: (id) => `/members/${id}`,

  // Billing
  BILLS: "/bills",
  BILL_BY_ID: (id) => `/bills/${id}`,
  GENERATE_BILL: "/bills/generate",

  // Reports
  REPORTS: "/reports",
  REVENUE_REPORT: "/reports/revenue",
  USAGE_REPORT: "/reports/usage",
  CUSTOMER_REPORT: "/reports/customers",
};

// Request interceptor to add auth token
const getAuthToken = () => {
  return localStorage.getItem("authToken");
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `HTTP error! status: ${response.status}`
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

// Bookings API
export const bookingsAPI = {
  getAll: () => apiRequest(ENDPOINTS.BOOKINGS),

  getById: (id) => apiRequest(ENDPOINTS.BOOKING_BY_ID(id)),

  create: (bookingData) =>
    apiRequest(ENDPOINTS.BOOKINGS, {
      method: "POST",
      body: JSON.stringify(bookingData),
    }),

  update: (id, bookingData) =>
    apiRequest(ENDPOINTS.BOOKING_BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(bookingData),
    }),

  delete: (id) => apiRequest(ENDPOINTS.BOOKING_BY_ID(id), { method: "DELETE" }),

  checkAvailability: (tableId, date, startTime, duration) =>
    apiRequest(ENDPOINTS.CHECK_AVAILABILITY, {
      method: "POST",
      body: JSON.stringify({ tableId, date, startTime, duration }),
    }),
};

// Members API
export const membersAPI = {
  getAll: () => apiRequest(ENDPOINTS.MEMBERS),

  getById: (id) => apiRequest(ENDPOINTS.MEMBER_BY_ID(id)),

  create: (memberData) =>
    apiRequest(ENDPOINTS.MEMBERS, {
      method: "POST",
      body: JSON.stringify(memberData),
    }),

  update: (id, memberData) =>
    apiRequest(ENDPOINTS.MEMBER_BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(memberData),
    }),

  delete: (id) => apiRequest(ENDPOINTS.MEMBER_BY_ID(id), { method: "DELETE" }),
};

// Billing API
export const billingAPI = {
  getAll: () => apiRequest(ENDPOINTS.BILLS),

  getById: (id) => apiRequest(ENDPOINTS.BILL_BY_ID(id)),

  generate: (gameId) =>
    apiRequest(ENDPOINTS.GENERATE_BILL, {
      method: "POST",
      body: JSON.stringify({ gameId }),
    }),

  markPaid: (id, paymentData) =>
    apiRequest(ENDPOINTS.BILL_BY_ID(id), {
      method: "PUT",
      body: JSON.stringify({
        status: "paid",
        ...paymentData,
      }),
    }),
};

// Reports API
export const reportsAPI = {
  getRevenue: (dateRange) =>
    apiRequest(`${ENDPOINTS.REVENUE_REPORT}?range=${dateRange}`),

  getUsage: (dateRange) =>
    apiRequest(`${ENDPOINTS.USAGE_REPORT}?range=${dateRange}`),

  getCustomers: (dateRange) =>
    apiRequest(`${ENDPOINTS.CUSTOMER_REPORT}?range=${dateRange}`),
};

// Export default API object
const api = {
  auth: authAPI,
  tables: tablesAPI,
  games: gamesAPI,
  bookings: bookingsAPI,
  members: membersAPI,
  billing: billingAPI,
  reports: reportsAPI,
};

export default api;
