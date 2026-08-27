import { application, NextFunction, Request, Response } from "express";
import crypto from "crypto";

import { Payment } from "../models/payment-model";
import { Transaction } from "../models/trasection-model";
import { razorpay } from "../services/razortpay";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import API from "razorpay/dist/types/api";

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


verifyPayment() is the next controller. The important security rule is that the server must verify Razorpay's signature before marking your payment as paid. Razorpay documents the signature as HMAC-SHA256 over the server-side Razorpay order_id and the returned payment_id; it also recommends using the order_id stored by your server rather than trusting the browser's copy.
 */
export const verifyPayment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { paymentId, razorpayOrderId, razorpay_signature } = req.body;

    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!paymentId || !razorpayOrderId || !razorpay_signature) {
      throw new ApiError(400, "Razorpay payment details are required ");
    }

    const payment = await Payment.findOne({
      providerOrderId: razorpayOrderId,
    });

    if (!payment) {
      throw new ApiError(404, "Payment record not found");
    }

    //only the payer can verify this payment
    if (payment.payerId.toString() !== req.user._id.toString()) {
      throw new ApiError(402, "You are not authorize to verify this payment");
    }

    const transaction = await Transaction.findById(payment.transactionId);

    if (!transaction) {
      throw new ApiError(404, "Transaction not found");
    }

    if (payment.status === "paid") {
      return res
        .status(200)
        .json(new ApiResponse(200, payment, "Payment id already verified"));
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      throw new ApiError(500, "Razorpay secret is not configured");
    }

    const body = `${payment.providerOrderId}|${paymentId}`;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    if (expectedBuffer.length !== receivedBuffer.length) {
      throw new ApiError(400, "Invalid payment signature");
    }

    const signatureValid = crypto.timingSafeEqual(
      expectedBuffer,
      receivedBuffer
    );

    if (!signatureValid) {
      payment.status = "failed";

      await payment.save();
      throw new ApiError(400, "Payment signature verification failed");
    }

    //payment is authentic

    payment.status = "paid";
    payment.providerPaymentId = paymentId;
    payment.providerOrderId = razorpayOrderId;
    payment.providerSignature = razorpay_signature;

    await payment.save();

    return res
      .status(200)
      .json(new ApiResponse(200, payment, "payment verified successfully"));
  }
);
