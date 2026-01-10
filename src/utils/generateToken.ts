import config from "../config/config";
import { IUser } from "../modules/user/models/user.model";
import jwt from "jsonwebtoken";
const generateToken = (user: IUser) => {
  return jwt.sign(
    { userId: user._id, userName: user.userName, role: user.role },
    config.JWT_SECRET as string,
    {
      expiresIn: "1h",
    }
  );
};
export default generateToken;
