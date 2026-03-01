import { Request, Response } from "express";
import { bookingService } from "../services/booking.service";

// Create a new booking
export const createBooking = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const bookingData = req.body;
    const booking = await bookingService.createBooking(bookingData);
    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error creating booking",
    });
  }
};

// Get all bookings
export const getAllBookings = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const bookings = await bookingService.getAllBookings();
    return res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: bookings,
      count: bookings.length,
    });
  } catch (error: any) {
    console.error("Error getting bookings:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error getting bookings",
    });
  }
};

// Get booking by ID
export const getBookingById = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    const booking = await bookingService.getBookingById(id as string);
    return res.status(200).json({
      success: true,
      message: "Booking retrieved successfully",
      data: booking,
    });
  } catch (error: any) {
    console.error("Error getting booking:", error);
    if (error.message === "Booking not found") {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Error getting booking",
    });
  }
};

// Get bookings by customer ID
export const getBookingsByCustomerId = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { customerId } = req.params;
    const bookings = await bookingService.getBookingsByCustomerId(
      customerId as string,
    );
    return res.status(200).json({
      success: true,
      message: "Customer bookings retrieved successfully",
      data: bookings,
      count: bookings.length,
    });
  } catch (error: any) {
    console.error("Error getting customer bookings:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error getting customer bookings",
    });
  }
};

// Get bookings by driver ID
export const getBookingsByDriverId = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { driverId } = req.params;
    const bookings = await bookingService.getBookingsByDriverId(
      driverId as string,
    );
    return res.status(200).json({
      success: true,
      message: "Driver bookings retrieved successfully",
      data: bookings,
      count: bookings.length,
    });
  } catch (error: any) {
    console.error("Error getting driver bookings:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error getting driver bookings",
    });
  }
};

// Get bookings by status
export const getBookingsByStatus = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { status } = req.params;
    const bookings = await bookingService.getBookingsByStatus(status as string);
    return res.status(200).json({
      success: true,
      message: "Bookings by status retrieved successfully",
      data: bookings,
      count: bookings.length,
    });
  } catch (error: any) {
    console.error("Error getting bookings by status:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error getting bookings by status",
    });
  }
};

// Update booking
export const updateBooking = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    const bookingData = req.body;
    const updatedBooking = await bookingService.updateBooking(
      id as string,
      bookingData,
    );
    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: updatedBooking,
    });
  } catch (error: any) {
    console.error("Error updating booking:", error);
    if (error.message === "Booking not found") {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Error updating booking",
    });
  }
};

// Update booking status
export const updateBookingStatus = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedBooking = await bookingService.updateBookingStatus(
      id as string,
      status,
    );
    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: updatedBooking,
    });
  } catch (error: any) {
    console.error("Error updating booking status:", error);
    if (error.message === "Booking not found") {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Error updating booking status",
    });
  }
};

// Delete booking
export const deleteBooking = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    await bookingService.deleteBooking(id as string);
    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting booking:", error);
    if (error.message === "Booking not found") {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Error deleting booking",
    });
  }
};

// Customer confirms deposit transfer
export const customerConfirmDepositTransfer = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;

    // Get booking to check current status
    const booking = await bookingService.getBookingById(id as string);

    if (booking.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "Booking must be in pending status to confirm deposit transfer",
      });
    }

    // Update booking status and deposit info
    const updatedBooking = await bookingService.updateBooking(id as string, {
      status: "awaiting_deposit_confirmation",
      depositStatus: "pending_confirmation",
      depositTransferredAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message:
        "Deposit transfer confirmed successfully. Waiting for staff confirmation.",
      data: updatedBooking,
    });
  } catch (error: any) {
    console.error("Error confirming deposit transfer:", error);
    if (error.message === "Booking not found") {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Error confirming deposit transfer",
    });
  }
};

// Staff confirms deposit received
export const staffConfirmDepositReceived = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;

    // Get booking to check current status
    const booking = await bookingService.getBookingById(id as string);

    if (booking.status !== "awaiting_deposit_confirmation") {
      return res.status(400).json({
        success: false,
        message: "Booking must be awaiting deposit confirmation",
      });
    }

    if (booking.depositStatus !== "pending_confirmation") {
      return res.status(400).json({
        success: false,
        message: "Deposit must be in pending confirmation status",
      });
    }

    // Update booking status and deposit info
    const updatedBooking = await bookingService.updateBooking(id as string, {
      status: "confirmed",
      depositStatus: "confirmed",
      depositConfirmedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message:
        "Deposit received confirmed successfully. Booking is now confirmed.",
      data: updatedBooking,
    });
  } catch (error: any) {
    console.error("Error confirming deposit received:", error);
    if (error.message === "Booking not found") {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Error confirming deposit received",
    });
  }
};
