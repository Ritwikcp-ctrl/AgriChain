import mongoose, {Schema} from "mongoose";
import * as jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const rentalSchema = new Schema({
    tool : {
        type : Schema.Types.ObjectId,
        ref : "Tool",
    },

    lessor : {
     type : Schema.Types.ObjectId,
     ref : "User",
       
    },

    lessee : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },

    price:{
        type: Number,
        default : "0.00rs",
        require: true,
    },

    status : {
        type : String,
        default : false,
        require : true,
    }

},{timestamps:true});

export const Rental = mongoose.model("Rental",rentalSchema);