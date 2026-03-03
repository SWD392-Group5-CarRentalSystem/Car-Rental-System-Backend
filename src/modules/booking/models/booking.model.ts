import mongoose, { Schema } from "mongoose";
import { Booking } from "../../../types/booking.type";

const bookingSchema = new Schema<Booking>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
    },
    rentalType: {
      type: String,
      enum: ["with_driver", "self_drive"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    actualReturnDate: {
      type: Date,
    },
    pickupLocation: {
      type: String,
      required: true,
    },
    dropoffLocation: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "awaiting_deposit_confirmation",
        "confirmed",
        "vehicle_delivered",
        "in_progress",
        "vehicle_returned",
        "completed",
        "cancelled",
        "deposit_lost",
      ],
      default: "pending",
    },
    totalAmount: {
      type: String,
      required: true,
    },
    depositAmount: {
      type: String,
      required: true,
    },
    depositStatus: {
      type: String,
      enum: [
        "not_paid",
        "pending_confirmation",
        "confirmed",
        "refunded",
        "lost",
      ],
      default: "not_paid",
    },
    depositTransferredAt: {
      type: Date,
    },
    depositConfirmedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const BookingModel = mongoose.model<Booking>("Booking", bookingSchema);
