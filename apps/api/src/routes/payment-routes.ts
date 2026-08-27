import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyToken";
import {
  createPayment,
  verifyPayment,
} from "../controllers/payment-controller";

const router = Router();

router.route("createPayment").post(verifyJwt, createPayment);

router.route("verify").post(verifyJwt, verifyPayment);

export default router;
