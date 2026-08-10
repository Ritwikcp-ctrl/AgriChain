import { NextFunction, Request, Response } from "express";
import { Rental } from "../models/rental-model";
import { Tool } from "../models/tools-model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const createRentalRequest = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { toolId, startDate, endDate } = req.body;

    if (!toolId || !startDate || !endDate) {
      throw new ApiError(404, "all field are required");
    }

    const tool = await Tool.findById(toolId);
    if (!tool) {
      throw new ApiError(404, "Tool not found");
    }
    if (!tool.availability) {
      throw new ApiError(404, "Tool is currently unavailable");
    }

    if (tool.owner.toString() === req.user?._id.toString()) {
      throw new ApiError(404, "You can not rent your own tool");
    }

    const rentalStart = new Date(startDate);
    const rentalEnd = new Date(endDate);

    if (rentalStart >= rentalEnd) {
      throw new ApiError(404, "End date must be after start date");
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const rentalDays = Math.ceil(
      (rentalEnd.getTime() - rentalStart.getTime()) / millisecondsPerDay
    );

    const totalPrice = rentalDays * tool.pricePerday;

    const rental = await Rental.create({
      tool: tool._id,
      lessor: tool.owner,
      lessee: req.user?._id,
      totalPrice,
      startDate: rentalStart,
      endDate: rentalEnd,
      status: "pending",
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, rental, "rental request created successfully")
      );
  }
);

export const getAllRentals = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const rentals = await Rental.find({
      $or: [{ lessor: req.user?._id }, { lessee: req.user?._id }],
    })
      .populate("tool")
      .populate("lessor", "fullname email")
      .populate("lessee", "fullname email");

    return res
      .status(200)
      .json(new ApiResponse(200, rentals, "Rental fetched successfully"));
  }
);

export const getAllRentalById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rentalId } = req.params;
    const rental = await Rental.findById(rentalId)
      .populate("tool")
      .populate("lessor", "fullname email")
      .populate("lessee", "fullname email");

    if (!rental) {
      throw new ApiError(404, "Rental not found");
    }
    //only lessee and lessor can view the rental
    if (
      rental.lessor._id.toString() !== req.user?._id.toString() &&
      rental.lessee._id.toString() !== req.user?._id.toString()
    ) {
      throw new ApiError(404, "you are not authorize to view this renatl");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, rental, "rental successfully fetched"));
  }
);

export const acceptRental = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rentalId } = req.params;
    //find the rental
    const rental = await Rental.findById(rentalId);
    if (!rental) {
      throw new ApiError(404, "rental not found");
    }
    //only the lessor can accept
    if (rental.lessor.toString() !== req.user?._id.toString()) {
      throw new ApiError(404, "only the tool owner can accept this renatl");
    }
    //rental must be pending
    if (rental.status !== "pending") {
      throw new ApiError(
        404,
        `rental can not be accepted because its status is ${rental.status}`
      );
    }
    //find the tool
    const tool = await Tool.findById(rental.tool);
    if (!tool) {
      throw new ApiError(404, "Tool not found");
    }
    //check tool availability
    if (!tool.availability) {
      throw new ApiError(404, "tool is no longer available");
    }
    //accept rental
    rental.status = "accepted";
    await rental.save();

    //make tool unavailable
    tool.availability = false;
    await tool.save();

    return res
      .status(200)
      .json(new ApiResponse(200, rental, "Rental accepted successfully"));
  }
);

export const rejectRental = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rentalId } = req.params;

    //find rental
    const rental = await Rental.findById(rentalId);
    if (!rental) {
      throw new ApiError(404, "rental not fond");
    }
    // only the lessor can reject
    if (rental.lessor.toString() !== req.user?._id.toString()) {
      throw new ApiError(404, "only the tool owner can reject this rental");
    }
    //rental must be pending
    if (rental.status !== "pending") {
      throw new ApiError(
        404,
        `rental cannot be rejected because its staus is ${rental.status}`
      );
    }
    //reject rental
    rental.status = "rejected";
    await rental.save();

    return res
      .status(200)
      .json(new ApiResponse(200, rental, "rental rejected successfully"));
  }
);

export const completeRental = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rentalId } = req.params;

    const rental = await Rental.findById(rentalId);
    if (!rental) {
      throw new ApiError(404, "Rental not found");
    }

    const userId = req.user?._id.toString();

    const isLessor = rental.lessor.toString() === userId;
    const isLessee = rental.lessee.toString() === userId;

    if (!isLessor && !isLessee) {
      throw new ApiError(404, "you are not allowed to complete this rental");
    }

    if (rental.status !== "accepted" && rental.status !== "active") {
      throw new ApiError(
        404,
        "Only accepted or active rentals can be completed"
      );
    }

    const tool = await Tool.findById(rental.tool);

    if (!tool) {
      throw new ApiError(404, "Tool not found");
    }

    rental.status = "completed";
    await rental.save();

    tool.availability = true;

    await tool.save();

    return res
      .status(200)
      .json(new ApiResponse(200, rental, "rental completed successfully"));
  }
);

export const cancelRental = asyncHandler(
  async (req: Request, res: Response) => {
    const { rentalId } = req.params;

    const rental = await Rental.findById(rentalId);

    if (!rental) {
      throw new ApiError(404, "rental not found");
    }

    //only lessee can cancel the rental request
    if (rental.lessee.toString() !== req.user?._is.toString()) {
      throw new ApiError(
        404,
        "Only the person who requested the rental can cancel it"
      );
    }

    //only pending rentals can be cancelled
    if (rental.status !== "pending") {
      throw new ApiError(
        404,
        `rental can not be cancelled because its status is ${rental.status}`
      );
    }
    rental.status = "cancelled";
    await rental.save();

    return res
      .status(200)
      .json(new ApiResponse(200, rental, "renatl cancelled successfully"));
  }
);
