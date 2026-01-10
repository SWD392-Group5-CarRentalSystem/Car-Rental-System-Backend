import bcrypt from "bcrypt";
import User from "../models/user.model";
import generateToken from "../../../utils/generateToken";
class UserService {
  //register nwe user
  async registerUser(userData: {
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) {
    const { username, email, phoneNumber, password } = userData;

    //kiem tra email co ton tai ko
    let user = await User.findOne({ email });
    if (user) {
      throw new Error("Email already exists");
    }
    //create new user
    user = new User({ username, email, phoneNumber, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const token = generateToken(user);
    return {
      message: "register success",
      token,
    };
  }
  //dang nhap
  async loginUser(credentials: { email: string; password: string }) {
    const { email, password } = credentials;

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Email doesnt exist");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid password");
    }
    const token = generateToken(user);

    return {
      success: true,
      token,
      user: {
        id: user._id,
        username: user.userName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    };
  }
  //password change
  async changePassword(passwordData: {
    email: string;
    oldPassword: string;
    newPassword: string;
  }) {
    const { email, oldPassword, newPassword } = passwordData;

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("email doesn't exist");
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error("invalid password");
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    return {
      message: "Password changed successfully",
    };
  }
}
export default new UserService();
