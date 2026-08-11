import { Router } from "express";

const router = Router();

import { verifyJwt } from "../middlewares/verifyToken";
import {
  cancelOrder,
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from "../controllers/order-controller";

router.route("/createorder").post(verifyJwt, createOrder);

router.route("/getorder").get(verifyJwt, getOrders);

router.route("/getbyId").get(verifyJwt, getOrderById);

router.route("/:orderid/cancel").patch(verifyJwt, cancelOrder);

router.route("/:orederUpdate").patch(verifyJwt, updateOrderStatus);

export default router;
