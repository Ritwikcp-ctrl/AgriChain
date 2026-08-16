import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyToken";
import { createConversation } from "../controllers/conversation-controller";

const router = Router();

router.route("/createConversation").post(verifyJwt, createConversation);


export default router;