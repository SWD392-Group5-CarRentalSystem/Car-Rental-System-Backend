import { IStaff } from "../../../types/user.type";
import { Staff } from "../models/user.model";

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
