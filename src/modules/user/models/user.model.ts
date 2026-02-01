import mongoose, { Document, Schema } from "mongoose";
import {
  ICustomer,
  IDriver,
  IManager,
  IStaff,
  IUser,
} from "../../../types/user.type";
const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["manager", "staff", "driver", "customer"],
      default: "customer",
    },
    DOB: { type: Date, required: true },
    avatar: { type: String },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);
export const User = mongoose.model<IUser>("User", userSchema);
//------------------------------ Customer ------------------------------

const customerSchema = new Schema<ICustomer>(
  {},
  {
    timestamps: true,
  },
);
export const Customer = mongoose.model<ICustomer>("Customer", customerSchema);
//------------------------------ Driver ------------------------------
const driverSchema = new Schema<IDriver>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      default: "driver",
    },
    DOB: { type: Date, required: true },
    avatar: { type: String },
    is_active: { type: Boolean, default: true },
    licenseNumber: { type: Number, required: true },
    Rating: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);
export const Driver = mongoose.model<IDriver>("Driver", driverSchema);
//------------------------------ Staff ------------------------------
const staffSchema = new Schema<IStaff>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      default: "staff",
    },
    DOB: { type: Date, required: true },
    avatar: { type: String },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);
export const Staff = mongoose.model<IStaff>("Staff", staffSchema);
//------------------------------ Staff ------------------------------
const managerSchema = new Schema<IManager>(
  {},
  {
    timestamps: true,
  },
);
export const Manager = mongoose.model<IManager>("Manager", managerSchema);
