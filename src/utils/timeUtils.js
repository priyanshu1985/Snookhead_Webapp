// Time-related utility functions for the Snooker Management System

/**
 * Format a date object to a readable string
 * @param {Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'time', 'datetime')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = "short") => {
  if (!date || !(date instanceof Date)) {
    return "Invalid Date";
  }

  const options = {
    short: {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
    long: {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    },
    time: {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    },
    datetime: {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    },
  };

  return date.toLocaleDateString("en-US", options[format] || options.short);
};

/**
 * Format time duration from milliseconds
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Format duration in hours and minutes only
 * @param {number} hours - Duration in hours (can be decimal)
 * @returns {string} Formatted duration string
 */
export const formatHoursMinutes = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/**
 * Get the time elapsed since a given date
 * @param {Date} startDate - Start date
 * @returns {string} Human-readable elapsed time
 */
export const getElapsedTime = (startDate) => {
  if (!startDate) return "Unknown";

  const now = new Date();
  const elapsed = now.getTime() - startDate.getTime();

  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
};

/**
 * Get time remaining until a future date
 * @param {Date} futureDate - Future date
 * @returns {string} Human-readable time remaining
 */
export const getTimeRemaining = (futureDate) => {
  if (!futureDate) return "Unknown";

  const now = new Date();
  const remaining = futureDate.getTime() - now.getTime();

  if (remaining <= 0) return "Expired";

  const seconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} remaining`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} remaining`;
  if (minutes > 0)
    return `${minutes} minute${minutes > 1 ? "s" : ""} remaining`;
  return `${seconds} second${seconds !== 1 ? "s" : ""} remaining`;
};

/**
 * Check if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean} True if the date is today
 */
export const isToday = (date) => {
  if (!date) return false;

  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Check if a date is tomorrow
 * @param {Date} date - Date to check
 * @returns {boolean} True if the date is tomorrow
 */
export const isTomorrow = (date) => {
  if (!date) return false;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};

/**
 * Check if a date is within a certain number of days from now
 * @param {Date} date - Date to check
 * @param {number} days - Number of days
 * @returns {boolean} True if within the specified days
 */
export const isWithinDays = (date, days) => {
  if (!date) return false;

  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= days;
};

/**
 * Get the start and end of the current day
 * @returns {Object} Object with startOfDay and endOfDay dates
 */
export const getTodayRange = () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  );

  return { startOfDay, endOfDay };
};

/**
 * Get the start and end of the current week
 * @returns {Object} Object with startOfWeek and endOfWeek dates
 */
export const getWeekRange = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
};

/**
 * Get the start and end of the current month
 * @returns {Object} Object with startOfMonth and endOfMonth dates
 */
export const getMonthRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  return { startOfMonth, endOfMonth };
};

/**
 * Convert 24-hour time string to 12-hour format
 * @param {string} time24 - Time in 24-hour format (e.g., "14:30")
 * @returns {string} Time in 12-hour format (e.g., "2:30 PM")
 */
export const formatTo12Hour = (time24) => {
  if (!time24) return "";

  const [hours, minutes] = time24.split(":");
  const hour24 = parseInt(hours, 10);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? "PM" : "AM";

  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Convert 12-hour time string to 24-hour format
 * @param {string} time12 - Time in 12-hour format (e.g., "2:30 PM")
 * @returns {string} Time in 24-hour format (e.g., "14:30")
 */
export const formatTo24Hour = (time12) => {
  if (!time12) return "";

  const [time, period] = time12.split(" ");
  const [hours, minutes] = time.split(":");
  let hour24 = parseInt(hours, 10);

  if (period === "PM" && hour24 !== 12) {
    hour24 += 12;
  } else if (period === "AM" && hour24 === 12) {
    hour24 = 0;
  }

  return `${hour24.toString().padStart(2, "0")}:${minutes}`;
};

/**
 * Generate time slots for a given day
 * @param {Date} date - Date for which to generate slots
 * @param {number} intervalMinutes - Interval between slots in minutes
 * @param {string} startTime - Start time in 24-hour format
 * @param {string} endTime - End time in 24-hour format
 * @returns {Array} Array of time slot objects
 */
export const generateTimeSlots = (
  date,
  intervalMinutes = 30,
  startTime = "08:00",
  endTime = "22:00"
) => {
  const slots = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentTime = new Date(date);
  currentTime.setHours(startHour, startMin, 0, 0);

  const endDateTime = new Date(date);
  endDateTime.setHours(endHour, endMin, 0, 0);

  while (currentTime < endDateTime) {
    slots.push({
      time: currentTime.toTimeString().substring(0, 5),
      display: formatTo12Hour(currentTime.toTimeString().substring(0, 5)),
      datetime: new Date(currentTime),
    });

    currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
  }

  return slots;
};

/**
 * Check if two date ranges overlap
 * @param {Date} start1 - Start of first range
 * @param {Date} end1 - End of first range
 * @param {Date} start2 - Start of second range
 * @param {Date} end2 - End of second range
 * @returns {boolean} True if ranges overlap
 */
export const doTimeRangesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

/**
 * Get business hours for a given date
 * @param {Date} date - Date to check
 * @returns {Object} Object with opening and closing times
 */
export const getBusinessHours = (date) => {
  const dayOfWeek = date.getDay();

  // Customize these hours based on your business requirements
  const hours = {
    weekday: { open: "08:00", close: "22:00" },
    weekend: { open: "09:00", close: "23:00" },
    sunday: { open: "10:00", close: "20:00" },
  };

  if (dayOfWeek === 0) {
    // Sunday
    return hours.sunday;
  } else if (dayOfWeek === 6) {
    // Saturday
    return hours.weekend;
  } else {
    // Monday-Friday
    return hours.weekday;
  }
};

export default {
  formatDate,
  formatDuration,
  formatHoursMinutes,
  getElapsedTime,
  getTimeRemaining,
  isToday,
  isTomorrow,
  isWithinDays,
  getTodayRange,
  getWeekRange,
  getMonthRange,
  formatTo12Hour,
  formatTo24Hour,
  generateTimeSlots,
  doTimeRangesOverlap,
  getBusinessHours,
};
