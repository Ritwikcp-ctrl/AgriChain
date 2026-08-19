import { NextFunction, Request, Response } from "express";
import { Conversation } from "../models/conversation-model";
import { Transaction } from "../models/trasection-model";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";

export const createConversation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { transactionId } = req.body;

    if (!transactionId) {
      return new ApiError(404, "invalid transactionId");
    }
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return new ApiError(404, "transaction not found");
    }

    const existingConversation = await Conversation.findOne({
      transactionId: transaction._id,
    });

    if (existingConversation) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            existingConversation,
            "conversation already exists"
          )
        );
    }

    const consversation = await Conversation.create({
        participants : [transaction.farmerId, transaction.buyerId],
        cropId: transaction.cropId,
        transactionId:transaction._id,
        status : "active",
    })

    return res.status(201).json(new ApiResponse(200,consversation,"conversation created successfully")

    )
  }
);
