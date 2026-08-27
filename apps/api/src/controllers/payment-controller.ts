import { application, NextFunction, Request, Response } from "express";

import { Payment } from "../models/payment-model";
import { Transaction } from "../models/trasection-model";
import { razorpay } from "../services/razortpay";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";

export const createPayment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { transactionId } = req.body;

    if (!req.user) {
      throw new ApiError(400, "User not found");
    }

    if (!transactionId) {
      throw new ApiError(401, "Transaction id is required");
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new ApiError(404, "Transaction not found");
    }

    if (transaction.buyerId.toString() !== req.user._id.toString()) {
      throw new ApiError(400, "Only the buyer can make this payment");
    }
    if (transaction.status !== "confirmed") {
      throw new ApiError(400, "Transaction must be confirmed before payment");
    }

    const existPayment = await Payment.findById({
      trnasactionId: transaction._id,
    });

    if (existPayment) {
      throw new ApiError(409, "Payment already exist for this transaction");
    }

    const amountInPaise = Math.round(transaction.totalAmount * 100);

    if (amountInPaise <= 0) {
      throw new ApiError(400, "Invalid transaction amount");
    }

    //create reazorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `txn_${transaction._id.toString()}`,
      notes: {
        transactionId: transaction._id.toString(),
        buyerId: transaction.buyerId.toString(),
        farmerId: transaction.farmerId.toString(),
      },
    });

    //create local payment record
    const payment = await Payment.create({
      transactionId: transaction._id,
      payerId: transaction.farmerId,
      receivedId: transaction.farmerId,
      amount: transaction.totalAmount,
      currency: "INR",
      status: "pending",
      provider: "razorpay",
      providerOrderId: razorpayOrder.id,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          paymentId: payment._id,
          razorpayOrderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
        },
        "Payment order created successfully"
      )
    );
  }
);
/* Razorpay's current documentation says the server should create an order for every payment and pass the returned order_id to checkout; the order amount is in currency subunits
 */
