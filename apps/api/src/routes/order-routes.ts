import { Router } from "express";

const router = Router();

import { verifyJwt } from "../middlewares/verifyToken";
import { createOrder, getOrders } from "../controllers/order-controller";

router.route("/createorder").post(verifyJwt, createOrder);

router.route("/getorder").get(verifyJwt, getOrders);

export default router;
