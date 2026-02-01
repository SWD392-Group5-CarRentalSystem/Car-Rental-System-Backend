import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import generateToken from "../../../utils/generateToken";
export const registerUser = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { username, email, phoneNumber, DOB, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ message: "Email already exists" });
    }
    user = new User({ username, email, DOB, phoneNumber, password });
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
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).send("Error at login");
  }
};

export const createDriver = async (
  req: Request,
  res: Response,
): Promise<any> => {};
export const createStaff = async (
  req: Request,
  res: Response,
): Promise<any> => {};
