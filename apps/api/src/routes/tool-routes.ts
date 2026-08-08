import { Router } from "express";

import {
  createTool,
  deleteTool,
  getAllTool,
  getToolbyId,
  updateTool,
} from "../controllers/tool-controller";
import { verifyJwt } from "../middlewares/verifyToken";

const router = Router();

router.route("/:createTool").post(verifyJwt, createTool);

router.route("/:gettool").get(getAllTool);

router.route("/:gettoolbyId").patch(verifyJwt, getToolbyId);

router.route("/:updatetool").patch(verifyJwt, updateTool);

router.route("/:deletetools").delete(verifyJwt,deleteTool);

export default router;