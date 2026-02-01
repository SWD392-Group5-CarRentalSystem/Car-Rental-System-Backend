import mongoose, { Schema } from "mongoose";
import { IVehicle } from "../../../types/vehicle.type";

const vehicleSchema = new Schema<IVehicle>(
  {
    vehicleName: {
      type: String,
      required: true,
    },

    vehicleType: {
      type: String,
      required: true,
    },
    vehicleStatus: {
      type: Boolean,
      required: true,
    },
    vehicleDetail: {
      vehicleBrands: {
        type: String,
        required: true,
      },
      vehicleColor: {
        type: String,
        required: true,
      },
      vehicleLicensePlate: {
        type: String,
        required: true,
      },
      vehicleYear: {
        type: Number,
        required: true,
      },
      vehicleSeatCount: {
        type: Number,
        required: true,
      },
      vehicleImage: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  },
);
export const Vehicle = mongoose.model<IVehicle>("Vehicle", vehicleSchema);
