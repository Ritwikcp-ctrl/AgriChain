import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyToken";
import { createTransaction } from "../controllers/transaction-controller";

const router = Router();

router.route("/transaction").post(verifyJwt, createTransaction);

export default router;
