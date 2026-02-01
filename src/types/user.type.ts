import { ObjectId } from "mongodb";

type IRole = "manager" | "staff" | "driver" | "customer";

export interface IUser {
  _id: ObjectId;
  username: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: IRole;
  avatar?: string;
  DOB: Date;
  is_active: boolean;
}
export interface ICustomer extends IUser {}

export interface IDriver extends IUser {
  licenseNumber: Number;
  Rating: Number;
}

export interface IStaff extends IUser {}
export interface IManager extends IUser {}
