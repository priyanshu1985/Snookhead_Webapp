// Application constants for the Snooker Management System

// Application metadata
export const APP_INFO = {
  NAME: "Snooker Club Management",
  VERSION: "1.0.0",
  DESCRIPTION: "Complete management solution for snooker clubs",
  AUTHOR: "Development Team",
};

// Table types and configurations
export const TABLE_TYPES = {
  FULL_SIZE: {
    id: "full-size",
    name: "Full Size",
    dimensions: "12ft x 6ft",
    defaultRate: 25,
  },
  COMPACT: {
    id: "compact",
    name: "Compact",
    dimensions: "10ft x 5ft",
    defaultRate: 20,
  },
  PREMIUM: {
    id: "premium",
    name: "Premium",
    dimensions: "12ft x 6ft",
    defaultRate: 35,
  },
};

// Table statuses
export const TABLE_STATUS = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  MAINTENANCE: "maintenance",
  RESERVED: "reserved",
  CLEANING: "cleaning",
};

// Game types
export const GAME_TYPES = {
  STANDARD: {
    id: "standard",
    name: "Standard Game",
    description: "Regular snooker game",
  },
  TOURNAMENT: {
    id: "tournament",
    name: "Tournament",
    description: "Official tournament match",
  },
  PRACTICE: {
    id: "practice",
    name: "Practice Session",
    description: "Practice and training",
  },
  COACHING: {
    id: "coaching",
    name: "Coaching",
    description: "Professional coaching session",
  },
};

// Game statuses
export const GAME_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  PAUSED: "paused",
  CANCELLED: "cancelled",
};

// Booking statuses
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  NO_SHOW: "no-show",
};

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  PARTIALLY_PAID: "partially-paid",
  OVERDUE: "overdue",
  REFUNDED: "refunded",
};

// Payment methods
export const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
  DIGITAL_WALLET: "digital-wallet",
  BANK_TRANSFER: "bank-transfer",
  CHEQUE: "cheque",
};

// Membership types
export const MEMBERSHIP_TYPES = {
  BASIC: {
    id: "basic",
    name: "Basic",
    discount: 0.05, // 5%
    benefits: ["5% discount on all games", "Priority booking"],
  },
  STANDARD: {
    id: "standard",
    name: "Standard",
    discount: 0.1, // 10%
    benefits: [
      "10% discount on all games",
      "Priority booking",
      "Free equipment rental",
    ],
  },
  PREMIUM: {
    id: "premium",
    name: "Premium",
    discount: 0.15, // 15%
    benefits: [
      "15% discount on all games",
      "Priority booking",
      "Free equipment rental",
      "Complimentary refreshments",
    ],
  },
};

// Member statuses
export const MEMBER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  EXPIRED: "expired",
};

// User roles
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
  MEMBER: "member",
};

// Report types
export const REPORT_TYPES = {
  REVENUE: "revenue",
  USAGE: "usage",
  CUSTOMERS: "customers",
  INVENTORY: "inventory",
  STAFF: "staff",
};

// Date ranges for reports
export const DATE_RANGES = {
  TODAY: "today",
  YESTERDAY: "yesterday",
  THIS_WEEK: "week",
  THIS_MONTH: "month",
  THIS_QUARTER: "quarter",
  THIS_YEAR: "year",
  LAST_7_DAYS: "last-7-days",
  LAST_30_DAYS: "last-30-days",
  CUSTOM: "custom",
};

// Business settings
export const BUSINESS_SETTINGS = {
  // Operating hours
  OPERATING_HOURS: {
    WEEKDAY: { open: "08:00", close: "22:00" },
    WEEKEND: { open: "09:00", close: "23:00" },
    SUNDAY: { open: "10:00", close: "20:00" },
  },

  // Booking settings
  BOOKING: {
    MIN_DURATION: 0.5, // 30 minutes
    MAX_DURATION: 8, // 8 hours
    MAX_ADVANCE_DAYS: 30, // 30 days in advance
    MIN_ADVANCE_MINUTES: 30, // 30 minutes minimum advance booking
  },

  // Billing settings
  BILLING: {
    TAX_RATE: 0.1, // 10%
    LATE_FEE_RATE: 0.05, // 5%
    ROUND_UP_INTERVAL: 15, // Round up to nearest 15 minutes
    CURRENCY: "USD",
    CURRENCY_SYMBOL: "$",
  },

  // Peak hours pricing
  PEAK_HOURS: {
    START: 18, // 6 PM
    END: 22, // 10 PM
    MULTIPLIER: 1.5,
  },

  // Weekend pricing
  WEEKEND_MULTIPLIER: 1.2,
};

// Equipment and accessories
export const EQUIPMENT = {
  CUES: {
    STANDARD: { name: "Standard Cue", rental: 5 },
    PREMIUM: { name: "Premium Cue", rental: 10 },
    PROFESSIONAL: { name: "Professional Cue", rental: 15 },
  },

  ACCESSORIES: {
    CHALK: { name: "Chalk", price: 2 },
    GLOVE: { name: "Glove", price: 10 },
    EXTENSION: { name: "Extension", rental: 3 },
  },
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

// API endpoints (used with base URL)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },
  TABLES: "/tables",
  GAMES: "/games",
  BOOKINGS: "/bookings",
  MEMBERS: "/members",
  BILLING: "/billing",
  REPORTS: "/reports",
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  USER_DATA: "userData",
  PREFERENCES: "userPreferences",
  THEME: "theme",
};

// Theme options
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  AUTO: "auto",
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
};

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
};

// Validation rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_PATTERN: /^[+]?[1-9][\d]{0,15}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

// Export status colors (for UI components)
export const STATUS_COLORS = {
  // Table statuses
  available: "#28a745",
  occupied: "#dc3545",
  maintenance: "#ffc107",
  reserved: "#17a2b8",
  cleaning: "#6c757d",

  // Booking statuses
  pending: "#ffc107",
  confirmed: "#28a745",
  cancelled: "#dc3545",
  completed: "#6c757d",
  "no-show": "#fd7e14",

  // Payment statuses
  paid: "#28a745",
  "partially-paid": "#ffc107",
  overdue: "#dc3545",
  refunded: "#6c757d",

  // Game statuses
  active: "#28a745",
  paused: "#ffc107",
  "game-completed": "#6c757d",
};

// Default values
export const DEFAULTS = {
  TABLE_HOURLY_RATE: 25,
  GAME_TYPE: GAME_TYPES.STANDARD.id,
  BOOKING_DURATION: 2, // hours
  MEMBERSHIP_TYPE: MEMBERSHIP_TYPES.BASIC.id,
  REPORT_DATE_RANGE: DATE_RANGES.THIS_WEEK,
  THEME: THEMES.LIGHT,
  LANGUAGE: "en",
};

export default {
  APP_INFO,
  TABLE_TYPES,
  TABLE_STATUS,
  GAME_TYPES,
  GAME_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  MEMBERSHIP_TYPES,
  MEMBER_STATUS,
  USER_ROLES,
  REPORT_TYPES,
  DATE_RANGES,
  BUSINESS_SETTINGS,
  EQUIPMENT,
  NOTIFICATION_TYPES,
  API_ENDPOINTS,
  STORAGE_KEYS,
  THEMES,
  PAGINATION,
  FILE_UPLOAD,
  VALIDATION,
  STATUS_COLORS,
  DEFAULTS,
};
