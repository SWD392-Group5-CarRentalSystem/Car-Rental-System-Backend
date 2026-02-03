import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User, Staff, Driver } from "../models/user.model";
import generateToken from "../../../utils/generateToken";
import { driverService, staffService } from "../services/user.service";
//------------------------------Auth------------------------------
export const registerUser = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { username, email, phoneNumber, DOB, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    let existingStaff = await Staff.findOne({ email });
    let existingDriver = await Driver.findOne({ email });
    if (user || existingStaff || existingDriver) {
      res.status(400).json({ message: "Email already exists" });
    }
    user = new User({ username, email, DOB, phoneNumber, password, role });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // uncoment nếu muốn register xong đăng nhập luôn
    // const token = generateToken(user)

    res.status(201).json({
      message: "register succesfully",
      // token
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("server error at resigter");
  }
};
export const loginUser = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email doesnt exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }
    const token = generateToken(user);
    res.status(200).json({
      message: "login success",
      success: true,
      token,
      data: {
        _id: user.id,
        username: user.username,
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
