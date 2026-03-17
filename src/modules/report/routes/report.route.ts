import express from "express";
import { getFinancialReport } from "../controllers/report.controller";

const router = express.Router();

/**
 * @swagger
 * /reports/financial:
 *   get:
 *     summary: Báo cáo tài chính (doanh thu + xe được đặt nhiều)
 *     tags: [Report]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Thời gian bắt đầu lọc theo createdAt
 *       - in: query
 *         name: to
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Thời gian kết thúc lọc theo createdAt
 *     responses:
 *       200:
 *         description: Trả về tổng doanh thu và top 10 xe được đặt nhiều
 */
router.get("/financial", getFinancialReport);

export default router;
