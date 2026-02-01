import { ObjectId } from "mongodb";

type rentailType = "with_driver" | "self_drive";
type status =
  | "pending"
  | "confirm"
  | "vehicle_delivered"
  | "in_progress"
  | "vehicle_returned"
  | "completed"
  | "cancelled"
  | "deposit_lost";
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
  status: status;
  totalAmount: String;
}
