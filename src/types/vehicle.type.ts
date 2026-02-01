import { ObjectId } from "mongodb";



export interface IVehicle {
  _id: ObjectId;
  vehicleName: string;
  vehicleType: String;
  vehicleStatus: boolean;
  vehicleDetail: IVehicleDetail;
}
export interface IVehicleDetail {
  vehicleBrands: string;
  vehicleColor: string;
  vehicleLicensePlate: string;
  vehicleYear: Number;
  vehicleSeatCount: Number;
  vehicleImage: string;
}
