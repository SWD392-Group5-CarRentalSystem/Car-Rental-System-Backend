import dotenv from "dotenv";

dotenv.config();

const config = {
  MONGODB_URI: process.env.MONGODB_URI_2 || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  PORT: process.env.PORT,
};
export default config;
