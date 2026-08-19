import mongoose, { Schema } from "mongoose";

const broadcastRequestSchema = new Schema(
  {
    broadcast: {
      type: Schema.Types.ObjectId,
      ref: "CropBroadcast",
      required: true,
    },

    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true }
);

broadcastRequestSchema.index({ broadcast: 1, requester: 1 }, { unique: true });

export const BroadcastRequest = mongoose.model(
  "BroadcastRequest",
  broadcastRequestSchema
);
