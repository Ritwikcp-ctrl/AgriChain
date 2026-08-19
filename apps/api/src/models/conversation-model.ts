import mongoose, { Document, Schema, Types } from "mongoose";

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  broadcastId: Types.ObjectId;
  cropId: Types.ObjectId;
  transactionId?: Types.ObjectId;
  status: "active" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    broadcastId: {
      type: Schema.Types.ObjectId,
      ref: "CropBroadcast",
      required: true,
    },

    cropId: {
      type: Schema.Types.ObjectId,
      ref: "Products",
      required: true,
    },

    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
    },

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema
);
