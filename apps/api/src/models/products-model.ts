import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required : true
    },

    quantity: {
      type: Number,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      default: 0,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    title: {
      type: String,
      required : true
    },

    description: {
      type: String,
      trim : true
    },

    unit: {
      type: String,
      enum :[
        "kg",
        "quintal",
        "ton",
        "bag"
      ],
      required : true
    },

    availability: {
      type: Boolean,
     default:true,
    },

    status: {
      type: String,
      enum:[
        "available",
        "reserved",
        "sold",
      ],
      default:"available",
    },

    listingType: {
      type: String,
      enum:["sale","auction"],
      default:"sale"
    },

    images: [
      {
        type: String,
      },
      //can have multiple images
    ],
  },
  { timestamps: true }
);

export const Products = mongoose.model("Products", productSchema);
