import mongoose, { Schema } from "mongoose";

const toolSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required:true,
    },

    name: {
      type: String,
      required: true,
      index: true,
      trim:true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    description: {
      type:String,
      required: true,
    },

    pricePerday: {
      type: Number,
      required: true,
      min: 0,
    },

    pricePerHour: {
      type: Number,
      required: true,
      min: 0,
    },

    securityDeposit: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    availability: {
      type:Boolean,
      default:true,
    },

    images: [
          {
            type:String
          }
    ],
      
    
  },
  { timestamps: true }
);

export const Tool = mongoose.model("Tool", toolSchema);
