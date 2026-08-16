import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyToken";
import {
  getConversatinMessages,
  sendMessage,
} from "../controllers/message-controlller";

const router = Router();

router.route("messageSend").post(verifyJwt, sendMessage);

router.route("/:conversationId").get(verifyJwt, getConversatinMessages);

export default router;
