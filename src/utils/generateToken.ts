import jwt from "jsonwebtoken";
import config from "../configs/config";
import { IUser } from "../types/user.type";
const generateToken = (user: IUser) => {
  return jwt.sign(
    { userId: user._id, username: user.username },
    config.JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );
};
export default generateToken;
