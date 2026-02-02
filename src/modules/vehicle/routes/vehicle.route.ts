import { Router } from "express";
import * as vehicleController from "../controllers/vehicle.controller";

const router = Router();

/**
 * @swagger
 * /vehicle:
 *   post:
 *     summary: Create a new vehicle
 *     tags: [Vehicle]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - make
 *               - model
 *               - year
 *               - licensePlate
 *               - pricePerDay
 *             properties:
 *               make:
 *                 type: string
 *                 example: "Toyota"
 *               model:
 *                 type: string
 *                 example: "Camry"
 *               year:
 *                 type: number
 *                 example: 2023
 *               licensePlate:
 *                 type: string
 *                 example: "29A-12345"
 *               pricePerDay:
 *                 type: number
 *                 example: 500000
 *               status:
 *                 type: string
 *                 enum: [available, rented, maintenance]
 *                 example: "available"
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 *       400:
 *         description: Bad request
 */
router.post("/", vehicleController.createVehicle);

/**
 * @swagger
 * /vehicle:
 *   get:
 *     summary: Get all vehicles
 *     tags: [Vehicle]
 *     responses:
 *       200:
 *         description: List of all vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicle'
 */
router.get("/", vehicleController.getAllVehicles);

/**
 * @swagger
 * /vehicle/{id}:
 *   get:
 *     summary: Get vehicle by ID
 *     tags: [Vehicle]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicle'
 *       404:
 *         description: Vehicle not found
 */
router.get("/:id", vehicleController.getVehicleById);

/**
 * @swagger
 * /vehicle/{id}:
 *   put:
 *     summary: Update vehicle by ID
 *     tags: [Vehicle]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               make:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: number
 *               pricePerDay:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [available, rented, maintenance]
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *       404:
 *         description: Vehicle not found
 */
router.put("/:id", vehicleController.updateVehicle);

/**
 * @swagger
 * /vehicle/{id}:
 *   delete:
 *     summary: Delete vehicle by ID
 *     tags: [Vehicle]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 *       404:
 *         description: Vehicle not found
 */
router.delete("/:id", vehicleController.deleteVehicle);

export default router;
