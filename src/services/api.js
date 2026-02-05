// API configuration and utilities for the Snooker Management System

const API_BASE_URL = import.meta.env.VITE_API_URL;

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
  ACTIVE_TABLES: "/activetables",
  START_SESSION: "/activetables/start",
  STOP_SESSION: "/activetables/stop",

  // Queue
  QUEUE: "/queue",
  QUEUE_SUMMARY: "/queue/summary",
  QUEUE_NEXT: "/queue/next",
  QUEUE_CLEAR: "/queue/clear",
  QUEUE_BY_ID: (id) => `/queue/${id}`,
  QUEUE_ASSIGN: (id) => `/queue/${id}/assign`,
  QUEUE_COMPLETE: (id) => `/queue/${id}/complete`,
  QUEUE_CANCEL: (id) => `/queue/${id}/cancel`,
  QUEUE_NOSHOW: (id) => `/queue/${id}/noshow`,
  QUEUE_TABLES: (gameid) => `/queue/tables/${gameid}`,

  // Menu
  MENU: "/menu",
  MENU_BY_ID: (id) => `/menu/${id}`,
  UPDATE_STOCK: (id) => `/menu/${id}/stock`,

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
  
  // Inventory
  INVENTORY: "/inventory",
  INVENTORY_BY_ID: (id) => `/inventory/${id}`,
  INVENTORY_QUANTITY: (id) => `/inventory/${id}/quantity`,
  INVENTORY_LOW_STOCK: "/inventory/alerts/low-stock",

  // Health
  HEALTH: "/health",

  // Stock Images
  STOCK_IMAGES_GAMES: "/stock-images/games",
  STOCK_IMAGES_MENU: "/stock-images/menu",

  // Bugs
  BUGS: "/bugs",
  BUG_BY_ID: (id) => `/bugs/${id}`,
  BUG_STATUS: (id) => `/bugs/${id}/status`,
  BUGS_STATS: "/bugs/stats/summary",

  // Admin Stations
  ADMIN_STATIONS: "/admin/stations",
  ADMIN_STATION_BY_ID: (id) => `/admin/stations/${id}`,
  ADMIN_STATION_PAUSE: (id) => `/admin/stations/${id}/pause-subscription`,
  ADMIN_STATION_UPGRADE: (id) => `/admin/stations/${id}/upgrade-subscription`,
  ADMIN_STATION_REMOVE: (id) => `/admin/stations/${id}/remove`,

  // Owner Panel Security
  OWNER_CHECK_SETUP: "/owner/panel/check-setup-status",
  OWNER_SETUP_PASSWORD: "/owner/panel/setup-password",
  OWNER_VERIFY_PASSWORD: "/owner/panel/verify-password",
  OWNER_CHANGE_PASSWORD: "/owner/panel/change-password",
  
  // Owner Dashboard Data
  OWNER_DASHBOARD_STATS: "/owner/dashboard/stats",
  OWNER_DASHBOARD_GAME_UTILIZATION: "/owner/dashboard/game-utilization",
  OWNER_DASHBOARD_REVENUE: "/owner/dashboard/revenue",
  OWNER_DASHBOARD_SUMMARY: "/owner/dashboard/summary",

  // Expenses
  EXPENSES: "/expenses",
};

// Image base URL for constructing full image URLs
export const IMAGE_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '');

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

// Auth endpoints that should NOT trigger redirect on 401
const AUTH_ENDPOINTS = [
  ENDPOINTS.LOGIN, 
  ENDPOINTS.REGISTER,
  ENDPOINTS.OWNER_VERIFY_PASSWORD
];

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

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // For login/register endpoints, don't redirect - let the error show on the page
      if (AUTH_ENDPOINTS.includes(endpoint)) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || "Invalid credentials"
        );
      }
      // For other endpoints, token is invalid or expired - redirect to login
      console.warn("Authentication failed: Token is invalid or expired");
      handleAuthError();
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || errorData.error || `HTTP error! status: ${response.status}`
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
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${ENDPOINTS.RESERVATIONS}?${queryString}` : ENDPOINTS.RESERVATIONS;
    return apiRequest(url);
  },

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

  cancel: (id) =>
    apiRequest(`${ENDPOINTS.RESERVATIONS}/${id}/cancel`, {
      method: "POST",
    }),

  autoassign: (data) =>
    apiRequest(ENDPOINTS.AUTOASSIGN, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Active Tables API
export const activeTablesAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${ENDPOINTS.ACTIVE_TABLES}?${queryString}` : ENDPOINTS.ACTIVE_TABLES;
    return apiRequest(url);
  },

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

  update: (id, data) =>
    apiRequest(`${ENDPOINTS.ACTIVE_TABLES}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Queue API
export const queueAPI = {
  // Get queue list (optional filters: gameid, status)
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${ENDPOINTS.QUEUE}?${queryString}` : ENDPOINTS.QUEUE;
    return apiRequest(url);
  },

  // Get queue summary for dashboard
  getSummary: () => apiRequest(ENDPOINTS.QUEUE_SUMMARY),

  // Get single queue entry
  getById: (id) => apiRequest(ENDPOINTS.QUEUE_BY_ID(id)),

  // Add to queue (walk-in)
  add: (queueData) =>
    apiRequest(ENDPOINTS.QUEUE, {
      method: "POST",
      body: JSON.stringify(queueData),
    }),

  // Assign table to queue entry (start game)
  assign: (id, tableid) =>
    apiRequest(ENDPOINTS.QUEUE_ASSIGN(id), {
      method: "POST",
      body: JSON.stringify({ tableid }),
    }),

  // Seat next in queue (auto-assign)
  next: (gameid = null) =>
    apiRequest(ENDPOINTS.QUEUE_NEXT, {
      method: "POST",
      body: JSON.stringify({ gameid }),
    }),

  // Complete game (end session)
  complete: (id) =>
    apiRequest(ENDPOINTS.QUEUE_COMPLETE(id), { method: "POST" }),

  // Cancel queue entry
  cancel: (id) =>
    apiRequest(ENDPOINTS.QUEUE_CANCEL(id), { method: "POST" }),

  // Mark as no-show
  noshow: (id) =>
    apiRequest(ENDPOINTS.QUEUE_NOSHOW(id), { method: "POST" }),

  // Clear all waiting entries
  clear: () => apiRequest(ENDPOINTS.QUEUE_CLEAR, { method: "POST" }),

  // Get available tables for a game
  getTables: (gameid) => apiRequest(ENDPOINTS.QUEUE_TABLES(gameid)),
};

// Menu API
export const menuAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${ENDPOINTS.MENU}?${queryString}` : ENDPOINTS.MENU;
    return apiRequest(url);
  },

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

  updateStock: (id, quantity) => 
    apiRequest(ENDPOINTS.UPDATE_STOCK(id), {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    }),
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
  getAll: (source = null) => {
    const url = source && source !== "all"
      ? `${ENDPOINTS.ORDERS}?source=${source}`
      : ENDPOINTS.ORDERS;
    return apiRequest(url);
  },

  getBySession: (sessionId) => apiRequest(`${ENDPOINTS.ORDERS}/by-session/${sessionId}`),

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

  addItems: (id, items) =>
    apiRequest(`${ENDPOINTS.ORDERS}/${id}/items`, {
      method: "POST",
      body: JSON.stringify({ items }),
    }),
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

  getById: (id) => apiRequest(`${ENDPOINTS.USERS}/${id}`),

  create: (userData) =>
    apiRequest(ENDPOINTS.USERS, {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  update: (id, userData) =>
    apiRequest(`${ENDPOINTS.USERS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    }),

  delete: (id) => apiRequest(`${ENDPOINTS.USERS}/${id}`, { method: "DELETE" }),

  changeRole: (id, role) => apiRequest(`${ENDPOINTS.USERS}/${id}/role`, { method: "POST", body: JSON.stringify({ role }) }),
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

  getByCustomerId: (customerId) => apiRequest(`${ENDPOINTS.WALLETS}/customer/${customerId}`),

  create: (walletData) =>
    apiRequest(`${ENDPOINTS.WALLETS}/create`, {
      method: "POST",
      body: JSON.stringify(walletData),
    }),

  update: (id, walletData) =>
    apiRequest(ENDPOINTS.WALLET_BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(walletData),
    }),

  addMoney: (customerId, amount) =>
    apiRequest(`${ENDPOINTS.WALLETS}/add-money`, {
      method: "POST",
      body: JSON.stringify({ customer_id: customerId, amount }),
    }),

  deductMoney: (customerId, amount) =>
    apiRequest(`${ENDPOINTS.WALLETS}/deduct-money`, {
      method: "POST",
      body: JSON.stringify({ customer_id: customerId, amount }),
    }),
};

// Inventory API
export const inventoryAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${ENDPOINTS.INVENTORY}?${queryString}` : ENDPOINTS.INVENTORY;
    return apiRequest(url);
  },

  getById: (id) => apiRequest(ENDPOINTS.INVENTORY_BY_ID(id)),

  create: (itemData) =>
    apiRequest(ENDPOINTS.INVENTORY, {
      method: "POST",
      body: JSON.stringify(itemData),
    }),

  update: (id, itemData) =>
    apiRequest(ENDPOINTS.INVENTORY_BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(itemData),
    }),

  updateQuantity: (id, changeData) =>
    apiRequest(ENDPOINTS.INVENTORY_QUANTITY(id), {
      method: "PATCH",
      body: JSON.stringify(changeData),
    }),

  delete: (id, permanent = false) => 
    apiRequest(`${ENDPOINTS.INVENTORY_BY_ID(id)}?permanent=${permanent}`, { 
      method: "DELETE" 
    }),

  getLowStock: () => apiRequest(ENDPOINTS.INVENTORY_LOW_STOCK),
};

// Health API
export const healthAPI = {
  check: () => apiRequest(ENDPOINTS.HEALTH),
};

// Stock Images API
export const stockImagesAPI = {
  getGameImages: () => apiRequest(ENDPOINTS.STOCK_IMAGES_GAMES),
  getMenuImages: () => apiRequest(ENDPOINTS.STOCK_IMAGES_MENU),
};

// Bugs API
export const bugsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${ENDPOINTS.BUGS}?${queryString}` : ENDPOINTS.BUGS;
    return apiRequest(url);
  },

  getById: (id) => apiRequest(ENDPOINTS.BUG_BY_ID(id)),

  create: (bugData) =>
    apiRequest(ENDPOINTS.BUGS, {
      method: "POST",
      body: JSON.stringify(bugData),
    }),

  update: (id, bugData) =>
    apiRequest(ENDPOINTS.BUG_BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(bugData),
    }),

  updateStatus: (id, status) =>
    apiRequest(ENDPOINTS.BUG_STATUS(id), {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  delete: (id) => apiRequest(ENDPOINTS.BUG_BY_ID(id), { method: "DELETE" }),

  getStats: () => apiRequest(ENDPOINTS.BUGS_STATS),
};

// Owner Security API
export const ownerAPI = {
  checkSetupStatus: () => apiRequest(ENDPOINTS.OWNER_CHECK_SETUP, { method: "POST" }),

  setupPassword: (password, confirmPassword) =>
    apiRequest(ENDPOINTS.OWNER_SETUP_PASSWORD, {
      method: "POST",
      body: JSON.stringify({ password, confirmPassword }),
    }),

  verifyPassword: (password) =>
    apiRequest(ENDPOINTS.OWNER_VERIFY_PASSWORD, {
      method: "POST",
      body: JSON.stringify({ password }),
    }),

  changePassword: (data) =>
    apiRequest(ENDPOINTS.OWNER_CHANGE_PASSWORD, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getStats: (period = "week") => apiRequest(`${ENDPOINTS.OWNER_DASHBOARD_STATS}?period=${period}`),
  
  getGameUtilization: (period = "week") => apiRequest(`${ENDPOINTS.OWNER_DASHBOARD_GAME_UTILIZATION}?period=${period}`),
  
  getRevenue: (period = "week") => apiRequest(`${ENDPOINTS.OWNER_DASHBOARD_REVENUE}?period=${period}`),
  
  getRevenue: (period = "week") => apiRequest(`${ENDPOINTS.OWNER_DASHBOARD_REVENUE}?period=${period}`),
  
  getSummary: (period = "week") => apiRequest(`${ENDPOINTS.OWNER_DASHBOARD_SUMMARY}?period=${period}`),

  getEmployeeActivity: (id, startDate, endDate) => {
      const params = new URLSearchParams();
      if(startDate) params.append('startDate', startDate);
      if(endDate) params.append('endDate', endDate);
      // Assuming route is mounted at /owner/dashboard
      return apiRequest(`/owner/dashboard/employees/${id}/activity?${params.toString()}`);
  },
};

export const expensesAPI = {
  getAll: () => apiRequest(`${ENDPOINTS.EXPENSES}`),
  create: (data) => apiRequest(`${ENDPOINTS.EXPENSES}`, { method: "POST", body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`${ENDPOINTS.EXPENSES}/${id}`, { method: "DELETE" }),
};

export const attendanceAPI = {
  checkIn: (user_id) => apiRequest(`/attendance/check-in`, { method: "POST", body: JSON.stringify({ user_id }) }),
  checkOut: (user_id, attendance_id) => apiRequest(`/attendance/check-out`, { method: "POST", body: JSON.stringify({ user_id, attendance_id }) }),
  getActive: (user_id) => apiRequest(`/attendance/active/${user_id}`),
  getHistory: (user_id) => apiRequest(`/attendance/user/${user_id}`),
};

// Admin Stations API (for admin panel to manage stations/cafes)
export const adminStationsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${ENDPOINTS.ADMIN_STATIONS}?${queryString}` : ENDPOINTS.ADMIN_STATIONS;
    return apiRequest(url);
  },

  getById: (id) => apiRequest(ENDPOINTS.ADMIN_STATION_BY_ID(id)),

  create: (stationData) =>
    apiRequest(`${ENDPOINTS.ADMIN_STATIONS}/create`, {
      method: "POST",
      body: JSON.stringify(stationData),
    }),

  pauseSubscription: (id) =>
    apiRequest(ENDPOINTS.ADMIN_STATION_PAUSE(id), {
      method: "POST",
    }),

  upgradeSubscription: (id, data) =>
    apiRequest(ENDPOINTS.ADMIN_STATION_UPGRADE(id), {
      method: "POST",
      body: JSON.stringify(data),
    }),

  remove: (id) =>
    apiRequest(ENDPOINTS.ADMIN_STATION_REMOVE(id), {
      method: "DELETE",
    }),
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
  inventory: inventoryAPI,
  bugs: bugsAPI,
  owner: ownerAPI,
  attendance: attendanceAPI,
  adminStations: adminStationsAPI,
  common: {
    uploadFile: async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      // Use raw fetch for FormData to let browser set Content-Type
      const token = localStorage.getItem("authToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      return await response.json();
    },
  },
};

export default api;
