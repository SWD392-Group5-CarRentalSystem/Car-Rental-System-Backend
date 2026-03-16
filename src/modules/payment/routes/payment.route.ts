import express from "express";
import { createVnpayUrl, createRemainingUrl, vnpayIPN, vnpayReturn } from "../controllers/payment.controller";

const router = express.Router();

/**
 * @swagger
 * /payment/vnpay/create-url:
 *   post:
 *     summary: Tạo URL thanh toán VNPay cho đặt cọc
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - depositAmount
 *             properties:
 *               bookingId:
 *                 type: string
 *                 example: "6788f1234abc56789def0123"
 *               depositAmount:
 *                 type: number
 *                 example: 1500000
 *     responses:
 *       200:
 *         description: Trả về URL redirect VNPay
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentUrl:
 *                       type: string
 */
router.post("/vnpay/create-url", createVnpayUrl);
router.post("/vnpay/create-remaining-url", createRemainingUrl);

/**
 * @swagger
 * /payment/vnpay/ipn:
 *   get:
 *     summary: VNPay IPN endpoint (server-to-server notification)
 *     tags: [Payment]
 *     description: VNPay gọi endpoint này sau khi thanh toán thành công. Cần public URL (không dùng được trên localhost mà không có ngrok).
 *     responses:
 *       200:
 *         description: Phản hồi cho VNPay
 */
router.get("/vnpay/ipn", vnpayIPN);

/**
 * @swagger
 * /payment/vnpay/return:
 *   get:
 *     summary: VNPay return URL (redirect sau thanh toán)
 *     tags: [Payment]
 *     description: VNPay redirect người dùng về đây sau thanh toán. BE xác minh → redirect FE kèm kết quả.
 *     responses:
 *       302:
 *         description: Redirect về FE /payment/result
 */
router.get("/vnpay/return", vnpayReturn);

export default router;
