import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyToken";
import { confirmTransaction, createTransaction } from "../controllers/transaction-controller";

const router = Router();

router.route("/transaction").post(verifyJwt, createTransaction);

router.route("/confirmTran").patch(verifyJwt,confirmTransaction);

export default router;
