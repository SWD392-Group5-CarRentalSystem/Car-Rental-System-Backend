import { Booking } from "../../../types/booking.type";
import { BookingModel } from "../models/booking.model";
import { Driver } from "../../user/models/user.model";

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
        .populate("vehicleId", "vehicleName vehicleType price vehicleDetail")
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
        .populate("vehicleId", "vehicleName vehicleType price vehicleDetail")
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
        .populate("vehicleId", "vehicleName vehicleType price vehicleDetail")
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
        .populate("vehicleId", "vehicleName vehicleType price vehicleDetail")
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
        .populate("vehicleId", "vehicleName vehicleType price vehicleDetail")
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
        .populate("vehicleId", "vehicleName vehicleType price vehicleDetail")
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
        .populate("vehicleId", "vehicleName vehicleType price vehicleDetail")
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

  // Assign a driver to a booking (staff action)
  async assignDriver(bookingId: string, driverId: string) {
    try {
      const booking = await BookingModel.findById(bookingId);
      if (!booking) throw new Error("Booking not found");

      // Check if driver has a conflicting booking in the same time range
      const conflict = await BookingModel.findOne({
        driverId,
        _id: { $ne: bookingId },
        status: { $nin: ["cancelled", "completed", "deposit_lost"] },
        startDate: { $lt: booking.endDate },
        endDate: { $gt: booking.startDate },
      });
      if (conflict) {
        throw new Error("Tài xế đã có lịch trong khung thời gian này");
      }

      const updated = await BookingModel.findByIdAndUpdate(
        bookingId,
        {
          driverId,
          driverStatus: "pending_driver",
          driverRespondedAt: undefined,
          driverRejectReason: undefined,
        },
        { new: true, runValidators: true },
      )
        .populate("customerId", "username email phoneNumber")
        .populate("vehicleId", "vehicleName vehicleType price vehicleDetail")
        .populate("driverId", "username phoneNumber Rating licenseNumber");

      if (!updated) throw new Error("Booking not found");
      return updated;
    } catch (error) {
      throw error;
    }
  },

  // Driver accepts assigned booking
  async driverAcceptBooking(bookingId: string, driverId: string) {
    try {
      const booking = await BookingModel.findById(bookingId);
      if (!booking) throw new Error("Booking not found");
      if (String(booking.driverId) !== driverId)
        throw new Error("Bạn không được phân công cho đơn này");
      if (booking.driverStatus === "accepted")
        throw new Error("Bạn đã đồng ý đơn này rồi");

      const updated = await BookingModel.findByIdAndUpdate(
        bookingId,
        { driverStatus: "accepted", driverRespondedAt: new Date() },
        { new: true, runValidators: true },
      )
        .populate("customerId", "username email phoneNumber")
        .populate("vehicleId", "vehicleName vehicleType price vehicleDetail")
        .populate("driverId", "username phoneNumber Rating");

      if (!updated) throw new Error("Booking not found");
      return updated;
    } catch (error) {
      throw error;
    }
  },

  // Driver rejects assigned booking
  async driverRejectBooking(bookingId: string, driverId: string, reason?: string) {
    try {
      const booking = await BookingModel.findById(bookingId);
      if (!booking) throw new Error("Booking not found");
      if (String(booking.driverId) !== driverId)
        throw new Error("Bạn không được phân công cho đơn này");
      if (booking.driverStatus === "rejected")
        throw new Error("Bạn đã từ chối đơn này rồi");

      const updated = await BookingModel.findByIdAndUpdate(
        bookingId,
        {
          driverStatus: "rejected",
          driverRespondedAt: new Date(),
          driverRejectReason: reason || "",
          driverId: undefined,
        },
        { new: true, runValidators: true },
      )
        .populate("customerId", "username email phoneNumber")
        .populate("vehicleId", "vehicleName vehicleType price vehicleDetail");

      if (!updated) throw new Error("Booking not found");
      return updated;
    } catch (error) {
      throw error;
    }
  },

  // Get all drivers with availability status for a given time range
  async getDriversWithAvailability(startDate: Date, endDate: Date) {
    try {
      const drivers = await Driver.find({}).select(
        "username email phoneNumber Rating licenseNumber avatar",
      );

      // Find all driver IDs that are busy in this time range (active bookings)
      const busyBookings = await BookingModel.find({
        driverId: { $exists: true, $ne: null },
        status: { $nin: ["cancelled", "completed", "deposit_lost"] },
        startDate: { $lt: endDate },
        endDate: { $gt: startDate },
      }).select("driverId");

      const busyDriverIds = new Set(
        busyBookings.map((b) => String(b.driverId)),
      );

      return drivers.map((driver) => ({
        ...driver.toObject(),
        isBusy: busyDriverIds.has(String(driver._id)),
      }));
    } catch (error) {
      throw error;
    }
  },
};
