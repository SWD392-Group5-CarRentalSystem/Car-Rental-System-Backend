import { Request, Response } from "express";
import userService from "../services/user.service";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { username, email, phoneNumber, password } = req.body;
  try {
    const result = await userService.registerUser({
      username,
      email,
      phoneNumber,
      password,
    });
    res.status(201).json(result);
  } catch (err: any) {
    console.log(err);

    if ((err.message = "Email already exists")) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).send("server error");
  }
};
export const loginUser = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  try {
    const result = await userService.loginUser({ email, password });
    res.status(200).json(result);
  } catch (err: any) {
    console.log("error: ", err);
    if (
      err.message === "Email doesnt exist" ||
      err.message === "Invalid password"
    ) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).send("Server error");
  }
};
export const handleChangePassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { email, oldPassword, newPassword } = req.body;
  try {
    const result = await userService.changePassword({
      email,
      oldPassword,
      newPassword,
    });
    res.status(200).json(result);
  } catch (err: any) {
    console.error(err);
    if (
      err.message === "Email doesnt exist" ||
      err.message === "Invalid password"
    ) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).send("Server error");
  }
};
