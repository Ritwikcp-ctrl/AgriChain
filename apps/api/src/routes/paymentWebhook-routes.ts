import {Router} from "express";
import { razorpayWebhook } from "../controllers/paymentWebhook-controller";

const router = Router();



router.route("/razorpay").post(razorpayWebhook);

export default router;