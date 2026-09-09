import Razorpay from "razorpay";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

      
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
  
});

// console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
