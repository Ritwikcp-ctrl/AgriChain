import mongoose, { Schema } from "mongoose";

const cropBroadcastSchema = new Schema(
  {
    farmer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: "Products",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    radius: {
      type: Number,
      default: 20,
      min: 1,
    },

    status: {
      type: String,
      enum: ["broadcasting", "matched", "closed", "cancelled"],
      default: "broadcasting",
    },
  },
  { timestamps: true }
);

cropBroadcastSchema.index({
  latitude: 1,
  longitude: 1,
});

export const CropBroadcast = mongoose.model(
  "CropBroadcast",
  cropBroadcastSchema
);
