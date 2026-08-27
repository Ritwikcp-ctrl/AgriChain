import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyToken";
import { createPayment } from "../controllers/payment-controller";

const router = Router();

router.route("createPayment").post(verifyJwt, createPayment);

export default router;
