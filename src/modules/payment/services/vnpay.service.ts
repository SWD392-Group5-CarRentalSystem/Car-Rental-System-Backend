import { VNPay, HashAlgorithm, ProductCode, VnpLocale } from "vnpay";
import config from "../../../configs/config";
import { BookingModel } from "../../booking/models/booking.model";

/**
 * VNPay instance — dùng npm package 'vnpay' (đã verified hoạt động đúng)
 * Package tự xử lý: sort keys → URLSearchParams encode → HMAC-SHA512
 */
const vnpay = new VNPay({
  tmnCode: config.VNP_TMN_CODE,
  secureSecret: config.VNP_HASH_SECRET,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: false,
  hashAlgorithm: HashAlgorithm.SHA512,
  enableLog: false,
});

export const vnpayService = {
  /**
   * Tạo VNPay payment URL
   * LƯU Ý: truyền depositAmount là số VND thực (package tự nhân 100 nội bộ)
   */
  createPaymentUrl(bookingId: string, depositAmount: number, ipAddr: string): string {
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: depositAmount,            // VND gốc — package nhân 100
      vnp_IpAddr: ipAddr || "127.0.0.1",
      vnp_TxnRef: bookingId,
      vnp_OrderInfo: `Dat coc don ${bookingId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: config.VNP_RETURN_URL,
      vnp_Locale: VnpLocale.VN,
    });

    console.log("[VNPay] createPaymentUrl =>");
    console.log("  TmnCode  :", config.VNP_TMN_CODE);
    console.log("  Amount   :", depositAmount, "VND");
    console.log("  TxnRef   :", bookingId);
    console.log("  ReturnUrl:", config.VNP_RETURN_URL);
    console.log("  URL      :", paymentUrl);

    return paymentUrl;
  },

  /**
   * Tạo VNPay payment URL cho thanh toán số tiền còn lại (sau khi kết thúc hành trình)
   */
  createRemainingPaymentUrl(bookingId: string, remainingAmount: number, ipAddr: string, role: string = 'driver'): string {
    // Dùng TxnRef khác để tránh VNPay từ chối trùng giao dịch (đã dùng bookingId cho cọc)
    const txnRef = bookingId + "_r";
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: remainingAmount,
      vnp_IpAddr: ipAddr || "127.0.0.1",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `remaining:${bookingId}:${role}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: config.VNP_RETURN_URL,
      vnp_Locale: VnpLocale.VN,
    });
    console.log("[VNPay] createRemainingPaymentUrl =>");
    console.log("  Amount   :", remainingAmount, "VND (remaining)");
    console.log("  TxnRef   :", txnRef);
    console.log("  Role     :", role);
    return paymentUrl;
  },

  /**
   * Xử lý return URL — VNPay redirect user về BE, BE verify rồi redirect FE
   */
  async handleReturn(query: Record<string, string>): Promise<{
    success: boolean;
    responseCode: string;
    bookingId: string;
    transactionNo: string;
    amount: number;
    isRemainingPayment: boolean;
    payerRole: string | null;
  }> {
    console.log("[VNPay] handleReturn query:", JSON.stringify(query));

    const responseCode = query["vnp_ResponseCode"] || "99";
    const txnRef = query["vnp_TxnRef"] || "";
    const transactionNo = query["vnp_TransactionNo"] || "";
    const rawAmount = Number(query["vnp_Amount"] || "0") / 100;
    const orderInfo = query["vnp_OrderInfo"] || "";
    const isRemainingPayment = orderInfo.startsWith("remaining:");
    // Với remaining payment, bookingId thực nằm trong OrderInfo (TxnRef là bookingId+"_r")
    // Format: remaining:bookingId:role
    const orderParts = orderInfo.split(":");
    const actualBookingId = isRemainingPayment ? orderParts[1] : txnRef;
    const payerRole = isRemainingPayment ? (orderParts[2] ?? "driver") : null;

    let isVerified = false;
    try {
      // verifyReturnUrl: package tự sort + URLSearchParams encode + HMAC-SHA512
      const result = vnpay.verifyReturnUrl(query as any);
      isVerified = result.isVerified;
      console.log("[VNPay] verifyReturnUrl => isVerified:", isVerified, "responseCode:", responseCode);
    } catch (err) {
      console.error("[VNPay] verifyReturnUrl error:", err);
    }

    const success = isVerified && responseCode === "00";

    if (success) {
      const booking = await BookingModel.findById(actualBookingId);
      if (isRemainingPayment) {
        if (booking && booking.status !== "completed") {
          await BookingModel.findByIdAndUpdate(actualBookingId, { status: "completed" });
          console.log("[VNPay] Booking completed (remaining paid):", actualBookingId);
        }
      } else {
        if (booking && booking.depositStatus !== "confirmed") {
          await BookingModel.findByIdAndUpdate(actualBookingId, {
            status: "confirmed",
            depositStatus: "confirmed",
            depositTransferredAt: new Date(),
          });
          console.log("[VNPay] Booking confirmed (deposit):", actualBookingId);
        }
      }
    }

    return { success, responseCode, bookingId: actualBookingId, transactionNo, amount: rawAmount, isRemainingPayment, payerRole };
  },

  /**
   * Xử lý IPN (server-to-server notification từ VNPay)
   */
  async handleIPN(query: Record<string, string>): Promise<{ RspCode: string; Message: string }> {
    console.log("[VNPay] handleIPN query:", JSON.stringify(query));

    let isVerified = false;
    try {
      const result = vnpay.verifyIpnCall(query as any);
      isVerified = result.isVerified;
    } catch (err) {
      console.error("[VNPay] verifyIpnCall error:", err);
      return { RspCode: "99", Message: "Unknown error" };
    }

    if (!isVerified) return { RspCode: "97", Message: "Invalid checksum" };

    const txnRef = query["vnp_TxnRef"];
    const responseCode = query["vnp_ResponseCode"];
    const transactionStatus = query["vnp_TransactionStatus"];
    const orderInfo = query["vnp_OrderInfo"] || "";
    const isRemainingPayment = orderInfo.startsWith("remaining:");
    const actualBookingId = isRemainingPayment ? orderInfo.split(":")[1] : txnRef;

    const booking = await BookingModel.findById(actualBookingId);
    if (!booking) return { RspCode: "01", Message: "Order not found" };

    if (isRemainingPayment) {
      if (booking.status === "completed") return { RspCode: "02", Message: "Order already completed" };
    } else {
      if (booking.depositStatus === "confirmed") return { RspCode: "02", Message: "Order already confirmed" };
    }

    if (responseCode === "00" && transactionStatus === "00") {
      if (isRemainingPayment) {
        await BookingModel.findByIdAndUpdate(actualBookingId, { status: "completed" });
      } else {
        await BookingModel.findByIdAndUpdate(actualBookingId, {
          status: "confirmed",
          depositStatus: "confirmed",
          depositTransferredAt: new Date(),
        });
      }
      return { RspCode: "00", Message: "Success" };
    } else {
      if (!isRemainingPayment) {
        await BookingModel.findByIdAndUpdate(actualBookingId, {
          status: "cancelled",
          depositStatus: "not_paid",
        });
      }
      return { RspCode: "00", Message: "Acknowledged" };
    }
  },
};
