import { NextFunction, Response } from "express";
import { RequestCustom } from "../types/express.type";
import jwt from "jsonwebtoken";
import config from "../config/config";
import { UserPayload } from "../types/user.type";
const authMiddleware = (
  req: RequestCustom,
  res: Response,
  next: NextFunction
): any => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({
      message: "vui lòng đăng nhập để thực hiện chức năng này",
    });
  }
  try {
    console.log("Token", token);
    const decode = jwt.verify(token, config.JWT_SECRET);

    req.user = decode as UserPayload;
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Token khong hop le",
    });
  }
};
export default authMiddleware;
