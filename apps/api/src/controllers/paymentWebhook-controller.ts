import { NextFunction, Request, Response } from "express";
import crypto from "crypto";

import { Payment } from "../models/payment-model";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";

export const razorpayWebhook = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new ApiError(404, "webhook secret is not configured");
    }

    const receivedSignature = req.headers["x-razorpay-signature"];

    if (!receivedSignature || typeof receivedSignature !== "string") {
      throw new ApiError(400, "signature is missing");
    }

    //req.body must be raw buffer
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    //compare signature safely
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(receivedSignature, "hex");

    if (expectedBuffer.length !== receivedBuffer.length) {
      throw new ApiError(401, "Invalid signature");
    }

    const signatureValid = crypto.timingSafeEqual(
      expectedBuffer,
      receivedBuffer
    );

    if (!signatureValid) {
      throw new ApiError(402, "signature invalid");
    }

    const event = JSON.parse(req.body.toString("utf8"));

    console.log("Razorpay webhook :", event.event);

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      if (!paymentEntity) {
        return res.status(200).json(new ApiResponse(200, "Webhook received"));
      }

      const razorpayPaymentId = paymentEntity.id;

      const razorpayOrderId = paymentEntity.order_id;

      const payment = await Payment.findOne({
        providerOrderId: razorpayOrderId,
      });

      if (!payment) {
        throw new ApiError(400, "local payment not found :", razorpayOrderId);
      }

      //idempotent: don't process an already paid payment again

      if (payment.status !== "paid") {
        throw new ApiError(400, "payment is not processed");
      }

      payment.status = "paid";

      payment.providerPaymentId = razorpayPaymentId;
      payment.paidAt = new Date();
      await payment.save();

      console.log(`payment ${payment._id} marked as paid`);
    }

    if(event.event === "payment.failed") {
        const paymentEntity = event.payload?.payment?.entity;

        if(!paymentEntity){
            return res.status(200).send("webhook received");
        }

        const razorpayOrderId = paymentEntity.order_id;

        const payment = await Payment.findOne({
            providerOrderId : razorpayOrderId,
        });

        if(!payment) {
            return res.status(200).send("webhook received")
        }
        if(payment.status !== "paid") {
            payment.status ="failed";

            await payment.save();
        }
    }

    return res.status(200).send("Webhook received")
  }
);
