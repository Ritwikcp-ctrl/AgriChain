import dotenv from "dotenv";
import app from "./app";
import connectDB from "./db";

dotenv.config({
    path :__dirname + "./env",
});

connectDB().then(()=>{
    app.listen(process.env.PORT || 8000, () =>{
        console.log(`Server is running at port : ${process.env.PORT}`);
    });
}).catch((err:Error) =>{
    console.log("mongoDB connection failed", err)
})