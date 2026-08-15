import mongoose, { Document, Schema, Types } from "mongoose";
export interface ITransaction extends Document {
  buyerId: Types.ObjectId;
  farmerId: Types.ObjectId;
  cropId: Types.ObjectId;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "completed" | "cacelled";
  createdAt: Date;
  updateAt: Date;
}

const trasactionSchema = new Schema<ITransaction>(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    farmerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cropId: {
      type: Schema.Types.ObjectId,
      ref: "Crop",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Transection = mongoose.model<ITransaction>(
  "Transaction",
  trasactionSchema
);
