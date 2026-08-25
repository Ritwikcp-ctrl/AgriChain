import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyToken";
import {
  cancelTransaction,
  completeTransaction,
  confirmTransaction,
  createTransaction,
  getTransactionById,
  getTransactions,
} from "../controllers/transaction-controller";

const router = Router();

router.route("/transaction").post(verifyJwt, createTransaction);

router.route("/confirmTran").patch(verifyJwt, confirmTransaction);

router.route("/cancel").patch(verifyJwt, cancelTransaction);

router.route("/transaction/complete").patch(verifyJwt, completeTransaction);

router.route("/getAlltransaction").get(verifyJwt, getTransactions);

router.route("/transactionId").get(verifyJwt, getTransactionById);

export default router;
