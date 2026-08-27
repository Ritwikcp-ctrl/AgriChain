import mongoose, { Schema, Types, Document } from "mongoose";

export interface IPayment extends Document {
  transactionId: Types.ObjectId;
  payerId: Types.ObjectId;
  receivedId: Types.ObjectId;

  amount: number;
  currency: string;

  status: "pending" | "processing" | "paid" | "failed" | "refunded";

  provider: "razorpay" | "stripe" | "manual";

  providerPaymentId?: string;
  providerOrderId?: string;
  providerSignature?: string;

  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },

    payerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receivedId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      required: true,
      uppercase: true,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "paid", "failed", "refunded"],
      default: "pending",
      required: true,
    },

    provider: {
      type: String,
      enum: ["razorpay", "stripe", "manual"],
      required: true,
    },

    providerPaymentId: {
      type: String,
    },

    providerOrderId: {
      type: String,
    },

    providerSignature: {
      type: String,
    },

    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
