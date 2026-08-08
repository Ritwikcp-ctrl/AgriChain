//Since order dependa on buyer :
import mongoose, { mongo, Schema } from "mongoose";

const orderSchema = new Schema({
    buyer:{
        type:Schema.Types.ObjectId,
        ref : "User",
    },

    seller : {
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    products :{
        type:Schema.Types.ObjectId,
        ref:"Product",
        required:true,
    }

    
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
