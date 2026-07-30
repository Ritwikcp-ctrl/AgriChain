//Since order dependa on buyer :
import mongoose, { mongo, Schema } from "mongoose";

const orderSchema = new Schema({
    buyer:{
        type:Schema.Types.ObjectId,
        ref : "User",
    },

    
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
