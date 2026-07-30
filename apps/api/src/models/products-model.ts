import mongoose,{Schema} from "mongoose";


const productSchema = new Schema({
    seller :{
        type : Schema.Types.ObjectId,
        ref : "User",
    },

    quantity : {
       type : Number,
       min :1,
    },

    price : {
        type : Number,
        required : true,
        default: 0,
    },

    category : {
        type :String,   // still add something
        required : true,
    },

    images :{
        type :String,
        required : true,
    }
},{timestamps:true})

export const Products = mongoose.model("Products",productSchema);