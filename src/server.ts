import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import vehicleRoutes from "./modules/vehicle/routes/vehicle.route";
import userRoutes from "./modules/user/routes/user.route";
import bookingRoutes from "./modules/booking/routes/booking.route";
import paymentRoutes from "./modules/payment/routes/payment.route";
import chatRoutes from "./modules/chat/chat.route";
import connectDB from "./configs/db";
import { swaggerSpec } from "./configs/swagger";
import passport from "passport";

const app = express();
const apiRouter = express.Router();

// middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routes
app.use("/api/v1", apiRouter);
apiRouter.use("/auth", userRoutes);
apiRouter.use("/vehicle", vehicleRoutes);
apiRouter.use("/booking", bookingRoutes);
apiRouter.use("/payment", paymentRoutes);
apiRouter.use("/chat", chatRoutes);

// connectDB
connectDB();

const PORT = process.env.PORT;
const SWAGGER_PORT = process.env.SWAGGER_PORT;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger is running at ${SWAGGER_PORT}`);
});