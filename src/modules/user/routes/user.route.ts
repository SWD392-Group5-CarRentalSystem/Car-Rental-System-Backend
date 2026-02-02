import express from "express";
import {
  loginUser,
  registerUser,
  createStaff,
  createDriver,
  getAllStaffs,
  getStaffById,
  updateStaff,
  deleteStaff,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
} from "../controllers/user.controller";
const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new customer
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - phoneNumber
 *               - password
 *               - DOB
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Nguyen Van A"
 *               email:
 *                 type: string
 *                 example: "customer@example.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "0901234567"
 *               password:
 *                 type: string
 *                 example: "Password123@"
 *               DOB:
 *                 type: string
 *                 format: date
 *                 example: "1995-03-15"
 *               avatar:
 *                 type: string
 *                 example: "https://i.pravatar.cc/150?img=1"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "staff1@carrental.com"
 *               password:
 *                 type: string
 *                 example: "Staff123@"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /auth/staff:
 *   get:
 *     summary: Get all staff members
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of staff members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Staff'
 *       401:
 *         description: Unauthorized
 */
router.get("/staff", getAllStaffs);

/**
 * @swagger
 * /auth/staff/{id}:
 *   get:
 *     summary: Get staff by ID
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       404:
 *         description: Staff not found
 */
router.get("/staff/:id", getStaffById);

/**
 * @swagger
 * /auth/staff:
 *   post:
 *     summary: Create a new staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - phoneNumber
 *               - password
 *               - DOB
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Nguyen Van A"
 *               email:
 *                 type: string
 *                 example: "staff1@carrental.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "0901234567"
 *               password:
 *                 type: string
 *                 example: "Staff123@"
 *               DOB:
 *                 type: string
 *                 format: date
 *                 example: "1995-03-15"
 *               avatar:
 *                 type: string
 *                 example: "https://i.pravatar.cc/150?img=1"
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Staff created successfully
 *       400:
 *         description: Bad request
 */
router.post("/staff", createStaff);

/**
 * @swagger
 * /auth/staff/{id}:
 *   put:
 *     summary: Update staff by ID
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Staff updated successfully
 *       404:
 *         description: Staff not found
 */
router.put("/staff/:id", updateStaff);

/**
 * @swagger
 * /auth/staff/{id}:
 *   delete:
 *     summary: Delete staff by ID
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff deleted successfully
 *       404:
 *         description: Staff not found
 */
router.delete("/staff/:id", deleteStaff);

/**
 * @swagger
 * /auth/driver:
 *   post:
 *     summary: Create a new driver
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - phoneNumber
 *               - password
 *               - DOB
 *               - licenseNumber
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Tran Van B"
 *               email:
 *                 type: string
 *                 example: "driver1@carrental.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "0907654321"
 *               password:
 *                 type: string
 *                 example: "Driver123@"
 *               DOB:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-20"
 *               licenseNumber:
 *                 type: number
 *                 example: 123456789
 *               avatar:
 *                 type: string
 *                 example: "https://i.pravatar.cc/150?img=10"
 *               Rating:
 *                 type: number
 *                 example: 0
 *     responses:
 *       201:
 *         description: Driver created successfully
 *       400:
 *         description: Bad request
 */
router.post("/driver", createDriver);

/**
 * @swagger
 * /auth/driver:
 *   get:
 *     summary: Get all drivers
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all drivers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Driver'
 *       401:
 *         description: Unauthorized
 */
router.get("/driver", getAllDrivers);

/**
 * @swagger
 * /auth/driver/{id}:
 *   get:
 *     summary: Get driver by ID
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Driver ID
 *     responses:
 *       200:
 *         description: Driver details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Driver'
 *       404:
 *         description: Driver not found
 */
router.get("/driver/:id", getDriverById);

/**
 * @swagger
 * /auth/driver/{id}:
 *   put:
 *     summary: Update driver by ID
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Driver ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Tran Van B Updated"
 *               email:
 *                 type: string
 *                 example: "driver1.updated@carrental.com"
 *               phoneNumber:
 *                 type: string
 *                 example: "0907654322"
 *               licenseNumber:
 *                 type: number
 *                 example: 987654321
 *               Rating:
 *                 type: number
 *                 example: 4.5
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Driver updated successfully
 *       404:
 *         description: Driver not found
 */
router.put("/driver/:id", updateDriver);

/**
 * @swagger
 * /auth/driver/{id}:
 *   delete:
 *     summary: Delete driver by ID
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Driver ID
 *     responses:
 *       200:
 *         description: Driver deleted successfully
 *       404:
 *         description: Driver not found
 */
router.delete("/driver/:id", deleteDriver);

export default router;
