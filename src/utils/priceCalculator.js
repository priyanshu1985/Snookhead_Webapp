// Price calculation utilities for the Snooker Management System

// Base rates and pricing configuration
const PRICING_CONFIG = {
  // Default hourly rates by table type
  DEFAULT_RATES: {
    "full-size": 25,
    compact: 20,
    premium: 35,
  },

  // Tax configuration
  TAX_RATE: 0.1, // 10%

  // Time-based pricing multipliers
  PEAK_HOURS: {
    start: 18, // 6 PM
    end: 22, // 10 PM
    multiplier: 1.5,
  },

  WEEKEND_MULTIPLIER: 1.2,

  // Membership discounts
  MEMBERSHIP_DISCOUNTS: {
    basic: 0.05, // 5% discount
    standard: 0.1, // 10% discount
    premium: 0.15, // 15% discount
  },

  // Minimum billing duration (in hours)
  MINIMUM_DURATION: 0.5,

  // Round up to nearest interval (in minutes)
  ROUND_UP_INTERVAL: 15,
};

/**
 * Calculate the base price for a game session
 * @param {number} duration - Duration in hours
 * @param {number} hourlyRate - Base hourly rate
 * @returns {number} Base price
 */
export const calculateBasePrice = (duration, hourlyRate) => {
  const minDuration = Math.max(duration, PRICING_CONFIG.MINIMUM_DURATION);
  return minDuration * hourlyRate;
};

/**
 * Round up duration to the nearest billing interval
 * @param {number} durationInMinutes - Duration in minutes
 * @returns {number} Rounded duration in hours
 */
export const roundUpDuration = (durationInMinutes) => {
  const interval = PRICING_CONFIG.ROUND_UP_INTERVAL;
  const roundedMinutes = Math.ceil(durationInMinutes / interval) * interval;
  return roundedMinutes / 60; // Convert to hours
};

/**
 * Check if a given time falls within peak hours
 * @param {Date} dateTime - Date and time to check
 * @returns {boolean} True if within peak hours
 */
export const isPeakHour = (dateTime) => {
  const hour = dateTime.getHours();
  const { start, end } = PRICING_CONFIG.PEAK_HOURS;
  return hour >= start && hour < end;
};

/**
 * Check if a given date is a weekend
 * @param {Date} date - Date to check
 * @returns {boolean} True if weekend (Saturday or Sunday)
 */
export const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

/**
 * Calculate time-based multiplier
 * @param {Date} startTime - Game start time
 * @param {Date} endTime - Game end time
 * @returns {number} Multiplier to apply
 */
export const calculateTimeMultiplier = (startTime, endTime) => {
  let multiplier = 1;

  // Check for peak hours
  const startHour = startTime.getHours();
  const endHour = endTime.getHours();
  const {
    start: peakStart,
    end: peakEnd,
    multiplier: peakMultiplier,
  } = PRICING_CONFIG.PEAK_HOURS;

  // If any part of the session is during peak hours
  if (
    (startHour >= peakStart && startHour < peakEnd) ||
    (endHour > peakStart && endHour <= peakEnd) ||
    (startHour < peakStart && endHour > peakEnd)
  ) {
    multiplier = peakMultiplier;
  }

  // Check for weekend
  if (isWeekend(startTime)) {
    multiplier *= PRICING_CONFIG.WEEKEND_MULTIPLIER;
  }

  return multiplier;
};

/**
 * Calculate membership discount
 * @param {string} membershipType - Type of membership
 * @param {number} baseAmount - Base amount to apply discount to
 * @returns {number} Discount amount
 */
export const calculateMembershipDiscount = (membershipType, baseAmount) => {
  if (!membershipType) return 0;

  const discountRate =
    PRICING_CONFIG.MEMBERSHIP_DISCOUNTS[membershipType.toLowerCase()] || 0;
  return baseAmount * discountRate;
};

/**
 * Calculate tax amount
 * @param {number} subtotal - Subtotal amount
 * @returns {number} Tax amount
 */
export const calculateTax = (subtotal) => {
  return subtotal * PRICING_CONFIG.TAX_RATE;
};

/**
 * Calculate the current cost of an ongoing game
 * @param {Date} startTime - When the game started
 * @param {number} hourlyRate - Hourly rate for the table
 * @param {string} membershipType - Optional membership type for discounts
 * @returns {Object} Current cost breakdown
 */
export const calculateCurrentGameCost = (
  startTime,
  hourlyRate,
  membershipType = null
) => {
  const now = new Date();
  const durationInMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
  const durationInHours = roundUpDuration(durationInMinutes);

  const basePrice = calculateBasePrice(durationInHours, hourlyRate);
  const timeMultiplier = calculateTimeMultiplier(startTime, now);
  const adjustedPrice = basePrice * timeMultiplier;

  const membershipDiscount = calculateMembershipDiscount(
    membershipType,
    adjustedPrice
  );
  const subtotal = adjustedPrice - membershipDiscount;
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;

  return {
    duration: durationInHours,
    durationDisplay: formatDuration(durationInHours),
    basePrice,
    timeMultiplier,
    adjustedPrice,
    membershipDiscount,
    subtotal,
    tax,
    total,
    breakdown: {
      baseRate: hourlyRate,
      actualDuration: durationInMinutes / 60,
      billedDuration: durationInHours,
      isPeakHour: isPeakHour(startTime) || isPeakHour(now),
      isWeekend: isWeekend(startTime),
    },
  };
};

/**
 * Calculate the final bill for a completed game
 * @param {Date} startTime - When the game started
 * @param {Date} endTime - When the game ended
 * @param {number} hourlyRate - Hourly rate for the table
 * @param {string} membershipType - Optional membership type for discounts
 * @param {number} additionalCharges - Any additional charges (food, drinks, etc.)
 * @returns {Object} Final bill breakdown
 */
export const calculateFinalBill = (
  startTime,
  endTime,
  hourlyRate,
  membershipType = null,
  additionalCharges = 0
) => {
  const durationInMinutes =
    (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  const durationInHours = roundUpDuration(durationInMinutes);

  const basePrice = calculateBasePrice(durationInHours, hourlyRate);
  const timeMultiplier = calculateTimeMultiplier(startTime, endTime);
  const adjustedPrice = basePrice * timeMultiplier;

  const membershipDiscount = calculateMembershipDiscount(
    membershipType,
    adjustedPrice
  );
  const gameSubtotal = adjustedPrice - membershipDiscount;
  const subtotal = gameSubtotal + additionalCharges;
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;

  return {
    duration: durationInHours,
    durationDisplay: formatDuration(durationInHours),
    basePrice,
    timeMultiplier,
    adjustedPrice,
    membershipDiscount,
    additionalCharges,
    subtotal,
    tax,
    total,
    breakdown: {
      baseRate: hourlyRate,
      actualDuration: durationInMinutes / 60,
      billedDuration: durationInHours,
      isPeakHour: isPeakHour(startTime) || isPeakHour(endTime),
      isWeekend: isWeekend(startTime),
      taxRate: PRICING_CONFIG.TAX_RATE,
    },
  };
};

/**
 * Format duration for display
 * @param {number} hours - Duration in hours
 * @returns {string} Formatted duration string
 */
export const formatDuration = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = "$") => {
  return `${currency}${amount.toFixed(2)}`;
};

/**
 * Get default rate for table type
 * @param {string} tableType - Type of table
 * @returns {number} Default hourly rate
 */
export const getDefaultRate = (tableType) => {
  return (
    PRICING_CONFIG.DEFAULT_RATES[tableType] ||
    PRICING_CONFIG.DEFAULT_RATES["full-size"]
  );
};

/**
 * Calculate estimated cost for a booking
 * @param {string} tableType - Type of table
 * @param {Date} startDateTime - Start date and time
 * @param {number} duration - Duration in hours
 * @param {string} membershipType - Optional membership type
 * @returns {Object} Estimated cost breakdown
 */
export const calculateBookingEstimate = (
  tableType,
  startDateTime,
  duration,
  membershipType = null
) => {
  const hourlyRate = getDefaultRate(tableType);
  const endDateTime = new Date(
    startDateTime.getTime() + duration * 60 * 60 * 1000
  );

  return calculateFinalBill(
    startDateTime,
    endDateTime,
    hourlyRate,
    membershipType
  );
};

export default {
  calculateCurrentGameCost,
  calculateFinalBill,
  calculateBookingEstimate,
  formatDuration,
  formatCurrency,
  getDefaultRate,
  isPeakHour,
  isWeekend,
};
