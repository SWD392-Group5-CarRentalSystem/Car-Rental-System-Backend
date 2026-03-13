import express from "express";
import cors from "cors";
import path from "path";
import swaggerUi from "swagger-ui-express";
import vehicleRoutes from "./modules/vehicle/routes/vehicle.route";
import userRoutes from "./modules/user/routes/user.route";
import bookingRoutes from "./modules/booking/routes/booking.route";
import paymentRoutes from "./modules/payment/routes/payment.route";
import reportRoutes from "./modules/report/routes/report.route";
import connectDB from "./configs/db";
import { swaggerSpec } from "./configs/swagger";
import passport from "passport";

const app = express();
const apiRouter = express.Router();

//middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
//swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//routes

app.use("/api/v1", apiRouter);
apiRouter.use("/auth", userRoutes);
apiRouter.use("/vehicle", vehicleRoutes);
apiRouter.use("/booking", bookingRoutes);
apiRouter.use("/payment", paymentRoutes);
apiRouter.use("/reports", reportRoutes);

//connectDB
connectDB();

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger is running at http://localhost:${PORT}/api-docs`);
});
//add develop 06/03/2026
