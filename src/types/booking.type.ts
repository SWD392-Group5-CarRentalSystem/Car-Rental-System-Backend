import { ObjectId } from "mongodb";

type rentailType = "with_driver" | "self_drive";
type status =
  | "pending"
  | "awaiting_deposit_confirmation"
  | "confirmed"
  | "vehicle_delivered"
  | "in_progress"
  | "vehicle_returned"
  | "completed"
  | "cancelled"
  | "deposit_lost";

type depositStatus =
  | "not_paid"
  | "pending_confirmation"
  | "confirmed"
  | "refunded"
  | "lost";

type driverStatus = "pending_driver" | "accepted" | "rejected";

export interface Booking {
  _id: ObjectId;
  customerId: ObjectId;
  vehicleId: ObjectId;
  driverId: ObjectId;
  rentalType: rentailType;
  startDate: Date;
  endDate: Date;
  actualReturnDate: Date;
  pickupLocation: string;
  dropoffLocation: string;
  status: status;
  totalAmount: String;
  depositAmount: String;
  depositStatus: depositStatus;
  depositTransferredAt?: Date;
  depositConfirmedAt?: Date;
  driverStatus?: driverStatus;
  driverRespondedAt?: Date;
  driverRejectReason?: string;
}
