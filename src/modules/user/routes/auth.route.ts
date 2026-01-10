import express from "express";
import {
  handleChangePassword,
  loginUser,
  registerUser,
} from "../controllers/user.controller";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.patch("/changePassword", handleChangePassword);
export default router;
