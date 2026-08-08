import mongoose, { Schema } from "mongoose";

const rentalSchema = new Schema(
  {
    tool: {
      type: Schema.Types.ObjectId,
      ref: "Tool",
      required: true,
    },

    lessor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lessee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    totalPrice: {
      type: Number,

      min: 0,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "active",
        "completed",
        "cancelled",
      ],
      default: "pending",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const Rental = mongoose.model("Rental", rentalSchema);
