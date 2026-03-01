import { Booking } from "../../../types/booking.type";
import { BookingModel } from "../models/booking.model";

export const bookingService = {
  // Create a new booking
  async createBooking(bookingData: Partial<Booking>) {
    try {
      const booking = new BookingModel(bookingData);
      await booking.save();
      return booking;
    } catch (error) {
      throw error;
    }
  },

  // Get all bookings
  async getAllBookings() {
    try {
      const bookings = await BookingModel.find({})
        .populate("customerId", "username email phoneNumber")
        .populate("vehicleId", "vehicleName vehicleType")
        .populate("driverId", "username phoneNumber Rating")
        .sort({ createdAt: -1 });
      return bookings;
    } catch (error) {
      throw error;
    }
  },

  // Get booking by ID
  async getBookingById(id: string) {
    try {
      const booking = await BookingModel.findById(id)
        .populate("customerId", "username email phoneNumber")
        .populate("vehicleId", "vehicleName vehicleType")
        .populate("driverId", "username phoneNumber Rating");
      if (!booking) {
        throw new Error("Booking not found");
      }
      return booking;
    } catch (error) {
      throw error;
    }
  },

  // Get bookings by customer ID
  async getBookingsByCustomerId(customerId: string) {
    try {
      const bookings = await BookingModel.find({ customerId })
        .populate("vehicleId", "vehicleName vehicleType")
        .populate("driverId", "username phoneNumber Rating")
        .sort({ createdAt: -1 });
      return bookings;
    } catch (error) {
      throw error;
    }
  },

  // Get bookings by driver ID
  async getBookingsByDriverId(driverId: string) {
    try {
      const bookings = await BookingModel.find({ driverId })
        .populate("customerId", "username email phoneNumber")
        .populate("vehicleId", "vehicleName vehicleType")
        .sort({ createdAt: -1 });
      return bookings;
    } catch (error) {
      throw error;
    }
  },

  // Get bookings by status
  async getBookingsByStatus(status: string) {
    try {
      const bookings = await BookingModel.find({ status })
        .populate("customerId", "username email phoneNumber")
        .populate("vehicleId", "vehicleName vehicleType")
        .populate("driverId", "username phoneNumber Rating")
        .sort({ createdAt: -1 });
      return bookings;
    } catch (error) {
      throw error;
    }
  },

  // Update booking
  async updateBooking(id: string, bookingData: Partial<Booking>) {
    try {
      const updatedBooking = await BookingModel.findByIdAndUpdate(
        id,
        bookingData,
        {
          new: true,
          runValidators: true,
        },
      )
        .populate("customerId", "username email phoneNumber")
        .populate("vehicleId", "vehicleName vehicleType")
        .populate("driverId", "username phoneNumber Rating");
      if (!updatedBooking) {
        throw new Error("Booking not found");
      }
      return updatedBooking;
    } catch (error) {
      throw error;
    }
  },

  // Update booking status
  async updateBookingStatus(id: string, status: string) {
    try {
      const updatedBooking = await BookingModel.findByIdAndUpdate(
        id,
        { status },
        {
          new: true,
          runValidators: true,
        },
      )
        .populate("customerId", "username email phoneNumber")
        .populate("vehicleId", "vehicleName vehicleType")
        .populate("driverId", "username phoneNumber Rating");
      if (!updatedBooking) {
        throw new Error("Booking not found");
      }
      return updatedBooking;
    } catch (error) {
      throw error;
    }
  },

  // Delete booking
  async deleteBooking(id: string) {
    try {
      const deletedBooking = await BookingModel.findByIdAndDelete(id);
      if (!deletedBooking) {
        throw new Error("Booking not found");
      }
      return deletedBooking;
    } catch (error) {
      throw error;
    }
  },
};
