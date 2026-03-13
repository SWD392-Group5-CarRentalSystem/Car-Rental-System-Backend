import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User, Staff, Driver } from "../models/user.model";
import generateToken from "../../../utils/generateToken";
import {
  customerService,
  driverService,
  staffService,
} from "../services/user.service";
//------------------------------Auth------------------------------
export const registerUser = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { username, email, phoneNumber, DOB, password, role } = req.body;
  try {
    if (!username || !email || !phoneNumber || !DOB || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let user = await User.findOne({ email });
    let existingStaff = await Staff.findOne({ email });
    let existingDriver = await Driver.findOne({ email });
    if (user || existingStaff || existingDriver) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const existingPhoneInUser = await User.findOne({ phoneNumber });
    const existingPhoneInStaff = await Staff.findOne({ phoneNumber });
    const existingPhoneInDriver = await Driver.findOne({ phoneNumber });
    if (existingPhoneInUser || existingPhoneInStaff || existingPhoneInDriver) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    user = new User({ username, email, DOB, phoneNumber, password, role });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // uncoment nếu muốn register xong đăng nhập luôn
    // const token = generateToken(user)

    res.status(201).json({
      success: true,
      message: "register succesfully",
      // token
    });
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number already exists",
      });
    }

    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Server error at register",
    });
  }
};
export const loginUser = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  try {
    // Try User (customer) collection first, then Staff, then Driver
    let foundUser: any = await User.findOne({ email });
    let foundRole = "customer";

    if (!foundUser) {
      foundUser = await Staff.findOne({ email });
      if (foundUser) foundRole = foundUser.role || "staff";
    } else {
      foundRole = foundUser.role || "customer";
    }

    if (!foundUser) {
      foundUser = await Driver.findOne({ email });
      if (foundUser) foundRole = foundUser.role || "driver";
    }

    if (!foundUser) {
      return res.status(400).json({ message: "Email doesnt exist" });
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    // Gán role vào object để generateToken đọc được
    foundUser.role = foundRole;
    const token = generateToken(foundUser);
    res.status(200).json({
      message: "login success",
      success: true,
      token,
      data: {
        _id: foundUser.id ?? foundUser._id,
        username: foundUser.username,
        role: foundRole,
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).send("Error at login");
  }
};
//------------------------------Staff------------------------------
export const createStaff = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { username, email, phoneNumber, DOB, password } = req.body;
  try {
    // Check if email already exists in any collection
    let existingUser = await User.findOne({ email });
    let existingStaff = await Staff.findOne({ email });
    let existingDriver = await Driver.findOne({ email });

    if (existingUser || existingStaff || existingDriver) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create staff using Staff model
    const staff = new Staff({
      username,
      email,
      DOB,
      phoneNumber,
      password,
      role: "staff",
    });

    const salt = await bcrypt.genSalt(10);
    staff.password = await bcrypt.hash(password, salt);
    await staff.save();

    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: {
        _id: staff._id,
        username: staff.username,
        email: staff.email,
        role: staff.role,
      },
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message || "Error creating staff",
    });
  }
};
export const getAllStaffs = async (req: Request, res: Response) => {
  try {
    const staffs = await staffService.getAllStaff();
    res.status(200).json({
      success: true,
      message: "Staffs retrieved successfully",
      data: staffs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving staff",
    });
  }
};
export const getStaffById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staff = await staffService.getStaffById(id as string);
    res.status(200).json({
      success: true,
      message: "Staff retrieved successfully",
      data: staff,
    });
  } catch (error: any) {
    res.status(error.message === "Staff not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Error at retrieving Staff",
    });
  }
};
export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staffData = req.body;
    const updatedStaff = await staffService.updateStaff(
      id as string,
      staffData,
    );
    res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      data: updatedStaff,
    });
  } catch (error: any) {
    res.status(error.message === "Staff not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Error updating staff",
    });
  }
};
export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleledStaff = staffService.deleteStaff(id as string);
    res.status(200).json({
      success: true,
      message: "Staff deleted successfully",
      data: deleledStaff,
    });
  } catch (error: any) {
    res.status(error.message === "Staff not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Error deleting Staff",
    });
  }
};
//------------------------------Driver------------------------------
export const createDriver = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { username, email, phoneNumber, DOB, password, licenseNumber } =
    req.body;
  try {
    // Check if email already exists in any collection
    let existingUser = await User.findOne({ email });
    let existingStaff = await Staff.findOne({ email });
    let existingDriver = await Driver.findOne({ email });

    if (existingUser || existingStaff || existingDriver) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Validate licenseNumber
    if (!licenseNumber) {
      return res
        .status(400)
        .json({ message: "License number is required for driver" });
    }

    // Create driver using Driver model
    const driver = new Driver({
      username,
      email,
      DOB,
      phoneNumber,
      password,
      role: "driver",
      licenseNumber,
      Rating: 0,
    });

    const salt = await bcrypt.genSalt(10);
    driver.password = await bcrypt.hash(password, salt);
    await driver.save();

    res.status(201).json({
      success: true,
      message: "Driver created successfully",
      data: {
        _id: driver._id,
        username: driver.username,
        email: driver.email,
        role: driver.role,
        licenseNumber: driver.licenseNumber,
        Rating: driver.Rating,
      },
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message || "Error creating driver",
    });
  }
};
export const getAllDrivers = async (req: Request, res: Response) => {
  try {
    const drivers = await driverService.getAllDriver();
    res.status(200).json({
      success: true,
      message: "Driver retrieved successfully",
      data: drivers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving staff",
    });
  }
};
export const getDriverById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const driver = await driverService.getDriverByid(id as string);
    res.status(200).json({
      success: true,
      message: "driver retrieved successfully",
      data: driver,
    });
  } catch (error: any) {
    res.status(error.message === "Driver not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Error at retrieving Driver",
    });
  }
};
export const updateDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const driverData = req.body;
    const updatedDriver = await driverService.updateDriver(
      id as string,
      driverData,
    );
    res.status(200).json({
      success: true,
      message: "Driver udpated successfully",
      data: updatedDriver,
    });
  } catch (error: any) {
    res.status(error.message === "Driver not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Error at updating Driver",
    });
  }
};
export const deleteDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedDriver = await driverService.deleteDriver(id as string);
    res.status(200).json({
      success: true,
      message: "Driver deleted successfully",
      data: deletedDriver,
    });
  } catch (error: any) {
    res.status(error.message === "Driver not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Error deleting Driver",
    });
  }
};
//------------------------------Customer / User------------------------------
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await customerService.getUserById(id as string);
    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(error.message === "User not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Error retrieving user",
    });
  }
};
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await customerService.updateUser(id as string, req.body);
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(error.message === "User not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Error updating user",
    });
  }
};
