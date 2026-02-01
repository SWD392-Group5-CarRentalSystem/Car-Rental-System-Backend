import express from "express";
import {
  loginUser,
  registerUser,
  createStaff,
  createDriver,
} from "../controllers/user.controller";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/staff", createStaff);
router.post("/driver", createDriver);
export default router;
