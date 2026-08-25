import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyToken";
import { cancelTransaction, confirmTransaction, createTransaction } from "../controllers/transaction-controller";

const router = Router();

router.route("/transaction").post(verifyJwt, createTransaction);

router.route("/confirmTran").patch(verifyJwt,confirmTransaction);

router.route("/cancel").patch(verifyJwt,cancelTransaction);

export default router;
