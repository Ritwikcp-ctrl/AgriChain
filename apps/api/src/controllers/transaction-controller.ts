import { NextFunction, Request, Response } from "express";

import { Conversation } from "../models/conversation-model";
import { Transaction } from "../models/trasection-model";
import { CropBroadcast } from "../models/cropBroadcast.model";

import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";

export const createTransaction = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { conversationId, quantity, pricePerUnit } = req.body;

    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!conversationId) {
      throw new ApiError(400, "conversation ID is required");
    }

    if (quantity === undefined || quantity <= 0) {
      throw new ApiError(401, "Quantity must be greater than 0");
    }

    if (pricePerUnit === undefined || pricePerUnit < 0) {
      throw new ApiError(400, "Invalid price per unit");
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new ApiError(404, "Conversation not found");
    }

    if (conversation.status !== "active") {
      throw new ApiError(400, "Conversation is closed");
    }

    const userId = req.user._id.toStrig();
    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === userId
    );

    if (!isParticipant) {
      throw new ApiError(
        403,
        "Transaction already exists for the conversation"
      );
    }

    if (conversation.transactionId) {
      throw new ApiError(
        409,
        "Transaction already exist for this conversation"
      );
    }

    const broadcast = await CropBroadcast.findById(conversation.broadcastId);

    if (!broadcast) {
      throw new ApiError(404, "Broadcast not found");
    }

    const farmerId = broadcast.farmer;

    const buyerId = conversation.participants.find(
      (participant) => participant.toString() !== farmerId.toString()
    );

    if (!buyerId) {
      throw new ApiError(400, "Buyer could not be determined");
    }

    const isFarmer = farmerId.toString() === userId;

    const isBuyer = buyerId.toString() === userId;

    if (!isFarmer && !isBuyer) {
      throw new ApiError(
        403,
        "You are not authorized to create this transaction"
      );
    }

    if (quantity > broadcast.quantity) {
      throw new ApiError(404, `Only ${broadcast.quantity} units are available`);
    }

    const totalAmount = quantity * pricePerUnit;

    const transaction = await Transaction.create({
      buyerId,
      farmerId,
      cropId: conversation.cropId,
      quantity,
      pricePerUnit,
      totalAmount,
      status: "pending",
    });

    conversation.transactionId = transaction._id;

    await conversation.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, transaction, "Transaction created succefully")
      );
  }
);

export const confirmTransaction = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { transactionId } = req.params;

    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      throw new ApiError(404, "Transaction not found");
    }

    if (transaction.farmerId.toString() !== req.user._id.toStrig()) {
      throw new ApiError(404, "Only the farmer can confirm this transaction");
    }

    if (transaction.status !== "pending") {
      throw new ApiError(
        400,
        `Transaction cannot be confirmed because its satatus is ${transaction.status}`
      );
    }

    transaction.status = "confirmed";

    await transaction.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, transaction, "Transaction confirmed successfully")
      );
  }
);

export const cancelTransaction = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { transactionId } = req.params;

    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      throw new ApiError(404, "Transaction not found");
    }

    const userId = req.user._id.toString();

    const isBuyer = transaction.buyerId.toString() === userId;

    const isFarmer = transaction.farmerId.toString() === userId;

    if (!isBuyer && !isFarmer) {
      throw new ApiError(
        400,
        `Transaction canot be cancelled because its satus is ${transaction.status}`
      );
    }

    transaction.status = "cancelled";

    await transaction.save();
    return res
      .status(200)
      .json(
        new ApiResponse(200, transaction, "Transaction cancelled successfully")
      );
  }
);


