import { Router } from "express";
import { verifyJwt } from "../middlewares/verifyToken";
import { createCropBroadcast } from "../controllers/cropBroadcast-controller";

const router = Router();

router.route("cropbroadcast").post(verifyJwt, createCropBroadcast);


export default router;