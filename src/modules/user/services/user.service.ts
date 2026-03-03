import { ICustomer, IDriver, IStaff } from "../../../types/user.type";
import { Driver, Staff, User } from "../models/user.model";

export const staffService = {
  async getAllStaff() {
    try {
      const staffs = await Staff.find({});
      return staffs;
    } catch (error) {
      throw error;
    }
  },
  async getStaffById(id: string) {
    try {
      const staff = await Staff.findById(id);
      if (!staff) {
        throw new Error("Staff not found");
      }
      return staff;
    } catch (error) {
      throw error;
    }
  },
  async updateStaff(id: string, staffData: Partial<IStaff>) {
    try {
      const updatedStaff = await Staff.findByIdAndUpdate(id, staffData, {
        new: true,
        runValidators: true,
      });
      if (!updatedStaff) {
        throw new Error("Staff not found");
      }
    } catch (error) {
      throw error;
    }
  },
  async deleteStaff(id: string) {
    try {
      const deletedStaff = await Staff.findByIdAndDelete(id);
      if (!deletedStaff) {
        throw new Error("Staff not found");
      }
      return deletedStaff;
    } catch (error) {
      throw error;
    }
  },
};
export const driverService = {
  async getAllDriver() {
    try {
      const drivers = await Driver.find({});
      return drivers;
    } catch (error) {
      throw error;
    }
  },
  async getDriverByid(id: string) {
    try {
      const driver = await Driver.findById(id);
      if (!driver) {
        throw new Error("Driver not found");
      }
      return driver
    } catch (error) {
      throw error;
    }
  },
  async updateDriver(id: string, driverData: Partial<IDriver>) {
    try {
      const updatedDriver = await Driver.findByIdAndUpdate(id, driverData, {
        new: true,
        runValidators: true,
      });
      if (!updatedDriver) {
        throw new Error("Driver not found");
      }
      return updatedDriver
    } catch (error) {
      throw error;
    }
  },
  async deleteDriver(id: string) {
    try {
      const deleteDriver = await Driver.findByIdAndDelete(id);
      if (!deleteDriver) {
        throw new Error("Driver not found");
      }
    } catch (error) {
      throw error;
    }
  },
};

export const customerService = {
  async getUserById(id: string) {
    try {
      const user = await User.findById(id).select("-password");
      if (!user) throw new Error("User not found");
      return user;
    } catch (error) {
      throw error;
    }
  },
  async updateUser(id: string, userData: Partial<ICustomer>) {
    try {
      const updated = await User.findByIdAndUpdate(id, userData, {
        new: true,
        runValidators: true,
      }).select("-password");
      if (!updated) throw new Error("User not found");
      return updated;
    } catch (error) {
      throw error;
    }
  },
};
