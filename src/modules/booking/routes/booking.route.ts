import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingsByCustomerId,
  getBookingsByDriverId,
  getBookingsByStatus,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
  customerConfirmDepositTransfer,
  staffConfirmDepositReceived,
} from "../controllers/booking.controller";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - customerId
 *         - vehicleId
 *         - rentalType
 *         - startDate
 *         - endDate
 *         - pickupLocation
 *         - totalAmount
 *         - depositAmount
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated booking ID
 *         customerId:
 *           type: string
 *           description: Customer ID reference
 *         vehicleId:
 *           type: string
 *           description: Vehicle ID reference
 *         driverId:
 *           type: string
 *           description: Driver ID reference (required for with_driver rental)
 *         rentalType:
 *           type: string
 *           enum: [with_driver, self_drive]
 *           description: Type of rental
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Booking start date
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Booking end date
 *         actualReturnDate:
 *           type: string
 *           format: date-time
 *           description: Actual return date
 *         pickupLocation:
 *           type: string
 *           description: Pickup location address
 *         status:
 *           type: string
 *           enum: [pending, awaiting_deposit_confirmation, confirmed, vehicle_delivered, in_progress, vehicle_returned, completed, cancelled, deposit_lost]
 *           description: Booking status
 *           default: pending
 *         totalAmount:
 *           type: string
 *           description: Total booking amount
 *         depositAmount:
 *           type: string
 *           description: Deposit amount
 *         depositStatus:
 *           type: string
 *           enum: [not_paid, pending_confirmation, confirmed, refunded, lost]
 *           description: Deposit status
 *           default: not_paid
 *         depositTransferredAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when customer confirmed deposit transfer
 *         depositConfirmedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when staff confirmed deposit received
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Booking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - vehicleId
 *               - rentalType
 *               - startDate
 *               - endDate
 *               - pickupLocation
 *               - totalAmount
 *               - depositAmount
 *             properties:
 *               customerId:
 *                 type: string
 *                 example: "65f1a2b3c4d5e6f7g8h9i0j1"
 *               vehicleId:
 *                 type: string
 *                 example: "65f1a2b3c4d5e6f7g8h9i0j2"
 *               driverId:
 *                 type: string
 *                 example: "65f1a2b3c4d5e6f7g8h9i0j3"
 *               rentalType:
 *                 type: string
 *                 enum: [with_driver, self_drive]
 *                 example: "self_drive"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-15T08:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-20T08:00:00.000Z"
 *               pickupLocation:
 *                 type: string
 *                 example: "123 Main Street, Ho Chi Minh City"
 *               totalAmount:
 *                 type: string
 *                 example: "5000000"
 *               depositAmount:
 *                 type: string
 *                 example: "1000000"
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       500:
 *         description: Server error
 */
router.post("/", createBooking);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Booking]
 *     responses:
 *       200:
 *         description: List of all bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 count:
 *                   type: number
 *       500:
 *         description: Server error
 */
router.get("/", getAllBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Booking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getBookingById);

/**
 * @swagger
 * /bookings/customer/{customerId}:
 *   get:
 *     summary: Get all bookings by customer ID
 *     tags: [Booking]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: List of customer bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 count:
 *                   type: number
 *       500:
 *         description: Server error
 */
router.get("/customer/:customerId", getBookingsByCustomerId);

/**
 * @swagger
 * /bookings/driver/{driverId}:
 *   get:
 *     summary: Get all bookings by driver ID
 *     tags: [Booking]
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *         description: Driver ID
 *     responses:
 *       200:
 *         description: List of driver bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 count:
 *                   type: number
 *       500:
 *         description: Server error
 */
router.get("/driver/:driverId", getBookingsByDriverId);

/**
 * @swagger
 * /bookings/status/{status}:
 *   get:
 *     summary: Get all bookings by status
 *     tags: [Booking]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, confirm, vehicle_delivered, in_progress, vehicle_returned, completed, cancelled, deposit_lost]
 *         description: Booking status
 *     responses:
 *       200:
 *         description: List of bookings by status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 count:
 *                   type: number
 *       500:
 *         description: Server error
 */
router.get("/status/:status", getBookingsByStatus);

/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     summary: Update booking
 *     tags: [Booking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vehicleId:
 *                 type: string
 *               driverId:
 *                 type: string
 *               rentalType:
 *                 type: string
 *                 enum: [with_driver, self_drive]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               actualReturnDate:
 *                 type: string
 *                 format: date-time
 *               pickupLocation:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, confirm, vehicle_delivered, in_progress, vehicle_returned, completed, cancelled, deposit_lost]
 *               totalAmount:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.put("/:id", updateBooking);

/**
 * @swagger
 * /bookings/{id}/status:
 *   patch:
 *     summary: Update booking status
 *     tags: [Booking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirm, vehicle_delivered, in_progress, vehicle_returned, completed, cancelled, deposit_lost]
 *                 example: "confirm"
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.patch("/:id/status", updateBookingStatus);

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Delete booking
 *     tags: [Booking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", deleteBooking);

/**
 * @swagger
 * /bookings/{id}/customer-confirm-deposit:
 *   patch:
 *     summary: Customer confirms deposit transfer
 *     tags: [Booking]
 *     description: Customer confirms that they have transferred the deposit money
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Deposit transfer confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid booking status
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.patch("/:id/customer-confirm-deposit", customerConfirmDepositTransfer);

/**
 * @swagger
 * /bookings/{id}/staff-confirm-deposit:
 *   patch:
 *     summary: Staff confirms deposit received
 *     tags: [Booking]
 *     description: Staff confirms that they have received the deposit money from customer
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Deposit received confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid booking or deposit status
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.patch("/:id/staff-confirm-deposit", staffConfirmDepositReceived);

export default router;
