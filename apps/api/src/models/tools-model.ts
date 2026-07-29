import mongoose , {Schema} from "mongoose";



const toolSchema = new Schema({

    owner :{
        type :Schema.Types.ObjectId,
        ref : "User",
    },

    name :{
        type:Schema.Types.ObjectId,
        ref : "Category",
        required: true,
        index:true,
    },

    category : {
        type:Schema.Types.ObjectId,
        ref: "Category",
        required : true,
    }, 

    description :{
        type:Schema.Types.ObjectId,
        ref : "Category",
        required : true,

    },

    pricePerday : {
        type : Schema.Types.ObjectId,
        ref : "Category",
        required : true,
        
    },

    availability : {
        type : Schema.Types.ObjectId,
        ref : "Category",
    },

    images :{
        type:Schema.Types.ObjectId,
        ref : "Category",
        required : true,

    }


},{timestamps : true})

export const Tool = mongoose.model("Tool",toolSchema);