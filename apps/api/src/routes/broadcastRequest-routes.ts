import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyToken";
import {
  acceptBrodcastRequest,
  createBroadcastRequest,
} from "../controllers/broadcastRequest-controller";

const router = Router();

router.route("/:boradcastId/request").post(verifyJwt, createBroadcastRequest);
router.route("/acceptbroadcast").post(verifyJwt, acceptBrodcastRequest);

export default router;
