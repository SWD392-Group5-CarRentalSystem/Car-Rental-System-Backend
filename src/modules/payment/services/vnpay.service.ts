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
   * Xử lý return URL — VNPay redirect user về BE, BE verify rồi redirect FE
   */
  async handleReturn(query: Record<string, string>): Promise<{
    success: boolean;
    responseCode: string;
    bookingId: string;
    transactionNo: string;
    amount: number;
  }> {
    console.log("[VNPay] handleReturn query:", JSON.stringify(query));

    const responseCode = query["vnp_ResponseCode"] || "99";
    const txnRef = query["vnp_TxnRef"] || "";
    const transactionNo = query["vnp_TransactionNo"] || "";
    const rawAmount = Number(query["vnp_Amount"] || "0") / 100;

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
      const booking = await BookingModel.findById(txnRef);
      if (booking && booking.depositStatus !== "confirmed") {
        await BookingModel.findByIdAndUpdate(txnRef, {
          status: "confirmed",
          depositStatus: "confirmed",
          depositTransferredAt: new Date(),
        });
        console.log("[VNPay] Booking confirmed:", txnRef);
      }
    }

    return { success, responseCode, bookingId: txnRef, transactionNo, amount: rawAmount };
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

    const booking = await BookingModel.findById(txnRef);
    if (!booking) return { RspCode: "01", Message: "Order not found" };
    if (booking.depositStatus === "confirmed") return { RspCode: "02", Message: "Order already confirmed" };

    if (responseCode === "00" && transactionStatus === "00") {
      await BookingModel.findByIdAndUpdate(txnRef, {
        status: "confirmed",
        depositStatus: "confirmed",
        depositTransferredAt: new Date(),
      });
      return { RspCode: "00", Message: "Success" };
    } else {
      await BookingModel.findByIdAndUpdate(txnRef, {
        status: "cancelled",
        depositStatus: "not_paid",
      });
      return { RspCode: "00", Message: "Acknowledged" };
    }
  },
};
