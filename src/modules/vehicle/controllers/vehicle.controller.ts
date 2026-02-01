import { Request, Response } from "express";
import * as vehicleService from "../services/vehicle.service";

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleData = req.body;
    const newVehicle = await vehicleService.createVehicle(vehicleData);
    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: newVehicle,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating vehicle",
    });
  }
};

export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();
    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: vehicles,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving vehicles",
    });
  }
};

export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vehicle = await vehicleService.getVehicleById(id as string);
    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: vehicle,
    });
  } catch (error: any) {
    res.status(error.message === "Vehicle not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Error retrieving vehicle",
    });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vehicleData = req.body;
    const updatedVehicle = await vehicleService.updateVehicle(id as string, vehicleData);
    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: updatedVehicle,
    });
  } catch (error: any) {
    res.status(error.message === "Vehicle not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Error updating vehicle",
    });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedVehicle = await vehicleService.deleteVehicle(id as string);
    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
      data: deletedVehicle,
    });
  } catch (error: any) {
    res.status(error.message === "Vehicle not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Error deleting vehicle",
    });
  }
};
