import React, { createContext, useState, useEffect } from "react";

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    // TODO: Load from API
    const mockBookings = [
      {
        id: 1,
        customerName: "John Doe",
        customerPhone: "+1234567890",
        customerEmail: "john.doe@example.com",
        tableId: 1,
        tableName: "Table 1",
        date: "2025-12-20",
        startTime: "14:00",
        duration: 2,
        gameType: "standard",
        status: "confirmed",
        totalAmount: 50,
        notes: "Birthday celebration",
        createdAt: new Date("2025-12-18"),
        updatedAt: new Date("2025-12-18"),
      },
      {
        id: 2,
        customerName: "Jane Smith",
        customerPhone: "+1234567891",
        customerEmail: "jane.smith@example.com",
        tableId: 2,
        tableName: "Table 2",
        date: "2025-12-20",
        startTime: "18:00",
        duration: 1.5,
        gameType: "tournament",
        status: "pending",
        totalAmount: 37.5,
        notes: "",
        createdAt: new Date("2025-12-19"),
        updatedAt: new Date("2025-12-19"),
      },
    ];
    setBookings(mockBookings);
  };

  const createBooking = async (bookingData) => {
    setIsLoading(true);
    try {
      // TODO: Validate availability
      const availability = await checkAvailability(
        bookingData.tableId,
        bookingData.date,
        bookingData.startTime,
        bookingData.duration
      );

      if (!availability.available) {
        return {
          success: false,
          error: "Table is not available for the selected time slot",
        };
      }

      const newBooking = {
        id: Date.now(), // Mock ID
        ...bookingData,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setBookings((prev) => [newBooking, ...prev]);

      // TODO: Send confirmation email if email provided
      if (bookingData.customerEmail) {
        // sendConfirmationEmail(newBooking);
      }

      return { success: true, booking: newBooking };
    } catch (error) {
      console.error("Create booking error:", error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateBooking = async (bookingId, updates) => {
    setIsLoading(true);
    try {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) {
        throw new Error("Booking not found");
      }

      const updatedBooking = {
        ...booking,
        ...updates,
        updatedAt: new Date(),
      };

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updatedBooking : b))
      );

      return { success: true, booking: updatedBooking };
    } catch (error) {
      console.error("Update booking error:", error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    return await updateBooking(bookingId, { status: "cancelled" });
  };

  const confirmBooking = async (bookingId) => {
    return await updateBooking(bookingId, { status: "confirmed" });
  };

  const deleteBooking = async (bookingId) => {
    setIsLoading(true);
    try {
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      return { success: true };
    } catch (error) {
      console.error("Delete booking error:", error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const checkAvailability = async (tableId, date, startTime, duration) => {
    try {
      // TODO: Call API to check availability
      // For now, return mock availability

      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(
        startDateTime.getTime() + duration * 60 * 60 * 1000
      );

      // Check existing bookings for conflicts
      const conflicts = bookings.filter((booking) => {
        if (booking.tableId !== tableId || booking.status === "cancelled") {
          return false;
        }

        const bookingStart = new Date(`${booking.date}T${booking.startTime}`);
        const bookingEnd = new Date(
          bookingStart.getTime() + booking.duration * 60 * 60 * 1000
        );

        return startDateTime < bookingEnd && endDateTime > bookingStart;
      });

      return {
        available: conflicts.length === 0,
        conflicts: conflicts,
      };
    } catch (error) {
      console.error("Check availability error:", error);
      return { available: false, error: error.message };
    }
  };

  const getBookingsByStatus = (status) => {
    return bookings.filter((booking) => booking.status === status);
  };

  const getBookingsByDate = (date) => {
    return bookings.filter((booking) => booking.date === date);
  };

  const getTodaysBookings = () => {
    const today = new Date().toISOString().split("T")[0];
    return getBookingsByDate(today);
  };

  const getUpcomingBookings = () => {
    const today = new Date().toISOString().split("T")[0];
    return bookings
      .filter(
        (booking) => booking.date >= today && booking.status !== "cancelled"
      )
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateA - dateB;
      });
  };

  const value = {
    bookings,
    isLoading,
    createBooking,
    updateBooking,
    cancelBooking,
    confirmBooking,
    deleteBooking,
    checkAvailability,
    getBookingsByStatus,
    getBookingsByDate,
    getTodaysBookings,
    getUpcomingBookings,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};

export default BookingContext;
