import express from "express";
import cors from "cors";
import vehicleRoutes from "./modules/vehicle/routes/vehicle.route";
import userRoutes from "./modules/user/routes/user.route";
import connectDB from "./configs/db";

const app = express();
const apiRouter = express.Router();

//middleware
app.use(cors());
app.use(express.json());

//routes

app.use("/api/v1", apiRouter);
apiRouter.use("/auth", userRoutes);
apiRouter.use("/vehicle", vehicleRoutes);

//connectDB
connectDB();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
