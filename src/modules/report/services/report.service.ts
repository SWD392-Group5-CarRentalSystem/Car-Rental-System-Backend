import { PipelineStage } from "mongoose";
import { BookingModel } from "../../booking/models/booking.model";

const REVENUE_STATUSES = ["completed", "vehicle_returned"];

const buildCreatedAtMatch = (from?: Date, to?: Date) => {
  const createdAt: { $gte?: Date; $lte?: Date } = {};

  if (from) {
    createdAt.$gte = from;
  }

  if (to) {
    createdAt.$lte = to;
  }

  return Object.keys(createdAt).length ? { createdAt } : {};
};

export const reportService = {
  async getFinancialReport(from?: Date, to?: Date) {
    const dateMatch = buildCreatedAtMatch(from, to);

    const revenuePipeline: PipelineStage[] = [
      {
        $match: {
          ...dateMatch,
          status: { $in: REVENUE_STATUSES },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $convert: {
                input: "$totalAmount",
                to: "double",
                onError: 0,
                onNull: 0,
              },
            },
          },
          completedBookings: { $sum: 1 },
        },
      },
    ];

    const topVehiclePipeline: PipelineStage[] = [
      {
        $match: {
          ...dateMatch,
          status: { $in: REVENUE_STATUSES },
        },
      },
      {
        $group: {
          _id: "$vehicleId",
          bookingCount: { $sum: 1 },
          revenue: {
            $sum: {
              $convert: {
                input: "$totalAmount",
                to: "double",
                onError: 0,
                onNull: 0,
              },
            },
          },
        },
      },
      { $sort: { bookingCount: -1, revenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "vehicles",
          localField: "_id",
          foreignField: "_id",
          as: "vehicle",
        },
      },
      {
        $project: {
          _id: 0,
          vehicleId: "$_id",
          bookingCount: 1,
          revenue: 1,
          vehicleName: {
            $ifNull: [
              { $arrayElemAt: ["$vehicle.vehicleName", 0] },
              "Unknown vehicle",
            ],
          },
          vehicleType: {
            $ifNull: [{ $arrayElemAt: ["$vehicle.vehicleType", 0] }, "N/A"],
          },
        },
      },
    ];

    const [revenueResult, topVehicles] = await Promise.all([
      BookingModel.aggregate(revenuePipeline),
      BookingModel.aggregate(topVehiclePipeline),
    ]);

    const revenue = revenueResult[0] || {
      totalRevenue: 0,
      completedBookings: 0,
    };

    return {
      from: from || null,
      to: to || null,
      totalRevenue: revenue.totalRevenue,
      completedBookings: revenue.completedBookings,
      topBookedVehicles: topVehicles,
    };
  },
};
