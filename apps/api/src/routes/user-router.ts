import { Router } from "express";
import { registerUser } from "../controllers/user-registerControllers";
import requestValidation from "../middlewares/Uservalidation";
import { userRegisterSchema } from "../utils/regiaterUserSchema";


const router = Router();

router
  .route("/register")
  .post(requestValidation(userRegisterSchema), registerUser );

export default router;
