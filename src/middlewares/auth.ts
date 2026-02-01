import { NextFunction, Request, Response } from "express";
import { IUser } from "../types/user.type";

const JWT_SECRET = process.env.JWT_SECRET || "";

export const authMiddleWare = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
  } catch (err: any) {
    res.status(401).json({ message: "Invalid Token" });
  }
};
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
