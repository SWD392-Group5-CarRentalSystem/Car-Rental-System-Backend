import { ObjectId } from "mongodb";
import { Vehicle } from "../models/vehicle.model";
import { IVehicle } from "../../../types/vehicle.type";

export const createVehicle = async (vehicleData: Omit<IVehicle, "_id">) => {
  try {
    const newVehicle = new Vehicle(vehicleData);
    const savedVehicle = await newVehicle.save();
    return savedVehicle;
  } catch (error) {
    throw error;
  }
};

export const getAllVehicles = async () => {
  try {
    const vehicles = await Vehicle.find();
    return vehicles;
  } catch (error) {
    throw error;
  }
};

export const getVehicleById = async (id: string) => {
  try {
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    return vehicle;
  } catch (error) {
    throw error;
  }
};

export const updateVehicle = async (
  id: string,
  vehicleData: Partial<IVehicle>,
) => {
  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(id, vehicleData, {
      new: true,
      runValidators: true,
    });
    if (!updatedVehicle) {
      throw new Error("Vehicle not found");
    }
    return updatedVehicle;
  } catch (error) {
    throw error;
  }
};

export const deleteVehicle = async (id: string) => {
  try {
    const deletedVehicle = await Vehicle.findByIdAndDelete(id);
    if (!deletedVehicle) {
      throw new Error("Vehicle not found");
    }
    return deletedVehicle;
  } catch (error) {
    throw error;
  }
};
