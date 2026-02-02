import express from "express";
import {
  loginUser,
  registerUser,
  createStaff,
  createDriver,
  getAllStaffs,
  getStaffById,
  updateStaff,
  deleteStaff,
} from "../controllers/user.controller";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/staff", getAllStaffs);
router.get("/staff/:id", getStaffById);
router.post("/staff", createStaff);
router.put("/staff/:id", updateStaff);
router.delete("/staff/:id", deleteStaff);


router.post("/driver", createDriver);
export default router;
