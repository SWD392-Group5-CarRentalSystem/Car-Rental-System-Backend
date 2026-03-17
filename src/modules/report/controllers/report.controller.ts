import { Request, Response } from "express";
import { reportService } from "../services/report.service";

export const getFinancialReport = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { from, to } = req.query;

    const fromDate = from ? new Date(String(from)) : undefined;
    const toDate = to ? new Date(String(to)) : undefined;

    if (fromDate && Number.isNaN(fromDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "from không hợp lệ. Dùng định dạng ISO date",
      });
    }

    if (toDate && Number.isNaN(toDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "to không hợp lệ. Dùng định dạng ISO date",
      });
    }

    const report = await reportService.getFinancialReport(fromDate, toDate);

    return res.status(200).json({
      success: true,
      message: "Lấy báo cáo tài chính thành công",
      data: report,
    });
  } catch (error: any) {
    console.error("Error generating financial report:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy báo cáo tài chính",
    });
  }
};
