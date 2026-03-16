import { Request, Response } from "express";
import config from "../../../configs/config";
import { vnpayService } from "../services/vnpay.service";

/**
 * POST /payment/vnpay/create-url
 * Body: { bookingId: string, depositAmount: number }
 * Returns: { success: true, data: { paymentUrl: string } }
 */
export const createVnpayUrl = async (req: Request, res: Response): Promise<any> => {
  try {
    const { bookingId, depositAmount } = req.body;

    if (!bookingId || !depositAmount) {
      return res.status(400).json({
        success: false,
        message: "bookingId và depositAmount là bắt buộc",
      });
    }

    if (Number(depositAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "depositAmount phải lớn hơn 0",
      });
    }

    // Get client IP
    const ipAddr =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "127.0.0.1";

    const paymentUrl = vnpayService.createPaymentUrl(
      bookingId,
      Number(depositAmount),
      ipAddr
    );

    return res.status(200).json({
      success: true,
      message: "Payment URL created successfully",
      data: { paymentUrl },
    });
  } catch (error: any) {
    console.error("Error creating VNPay URL:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi tạo link thanh toán",
    });
  }
};

/**
 * GET /payment/vnpay/ipn
 * Called server-to-server by VNPay after payment
 * Must respond with JSON { RspCode, Message }
 */
export const vnpayIPN = async (req: Request, res: Response): Promise<any> => {
  try {
    const query = req.query as Record<string, string>;
    const result = await vnpayService.handleIPN(query);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("VNPay IPN error:", error);
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

/**
 * GET /payment/vnpay/return
 * VNPay redirects user here after payment (via client browser)
 * We just read & verify the params, then redirect FE
 */
export const vnpayReturn = async (req: Request, res: Response): Promise<any> => {
  try {
    const query = req.query as Record<string, string>;
    const result = await vnpayService.handleReturn(query);

    // Redirect to FE with result params (use FRONTEND_URL, not VNP_RETURN_URL)
    const feBase = config.FRONTEND_URL || "http://localhost:5173";
    const returnUrl = new URL(`${feBase}/payment/result`);
    returnUrl.searchParams.set("success", String(result.success));
    returnUrl.searchParams.set("responseCode", result.responseCode);
    returnUrl.searchParams.set("bookingId", result.bookingId);
    returnUrl.searchParams.set("transactionNo", result.transactionNo);
    returnUrl.searchParams.set("amount", String(result.amount));
    if (result.isRemainingPayment) {
      returnUrl.searchParams.set("paymentType", "remaining");
      if (result.payerRole) returnUrl.searchParams.set("role", result.payerRole);
    }

    return res.redirect(returnUrl.toString());
  } catch (error: any) {
    console.error("VNPay return error:", error);
    const feBase = config.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(
      `${feBase}/payment/result?success=false&responseCode=99`
    );
  }
};

/**
 * POST /payment/vnpay/create-remaining-url
 * Body: { bookingId: string, remainingAmount: number, role?: string }
 * Returns: { success: true, data: { paymentUrl: string } }
 */
export const createRemainingUrl = async (req: Request, res: Response): Promise<any> => {
  try {
    const { bookingId, remainingAmount, role } = req.body;
    if (!bookingId || !remainingAmount) {
      return res.status(400).json({
        success: false,
        message: "bookingId và remainingAmount là bắt buộc",
      });
    }
    if (Number(remainingAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "remainingAmount phải lớn hơn 0",
      });
    }
    const ipAddr =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
      req.socket?.remoteAddress ||
      "127.0.0.1";
    const paymentUrl = vnpayService.createRemainingPaymentUrl(
      bookingId,
      Number(remainingAmount),
      ipAddr,
      role || "driver"
    );
    return res.status(200).json({
      success: true,
      message: "Remaining payment URL created successfully",
      data: { paymentUrl },
    });
  } catch (error: any) {
    console.error("Error creating remaining payment URL:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi tạo link thanh toán",
    });
  }
};
