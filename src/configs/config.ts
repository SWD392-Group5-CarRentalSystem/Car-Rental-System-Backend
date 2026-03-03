import dotenv from "dotenv";

dotenv.config();

const config = {
  MONGODB_URI: process.env.MONGODB_URI_2 || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  PORT: process.env.PORT,
  VNP_TMN_CODE: process.env.VNP_TMN_CODE || "6UUEN6W7",
  VNP_HASH_SECRET: process.env.VNP_HASH_SECRET || "40X8LWBCVY7HMRVVJVDF7Y7183FEYUX7",
  VNP_URL: process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  VNP_RETURN_URL: process.env.VNP_RETURN_URL || "http://localhost:4000/api/v1/payment/vnpay/return",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};
export default config;
