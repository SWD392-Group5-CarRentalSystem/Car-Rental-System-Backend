import { Router } from "express";
import * as vehicleController from "../controllers/vehicle.controller";

const router = Router();

// Create a new vehicle
router.post("/", vehicleController.createVehicle);

// Get all vehicles
router.get("/", vehicleController.getAllVehicles);

// Get vehicle by ID
router.get("/:id", vehicleController.getVehicleById);

// Update vehicle by ID
router.put("/:id", vehicleController.updateVehicle);

// Delete vehicle by ID
router.delete("/:id", vehicleController.deleteVehicle);

export default router;
