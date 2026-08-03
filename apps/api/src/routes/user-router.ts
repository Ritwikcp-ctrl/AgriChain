import { Router } from "express";
import { registerUser } from "../controllers/user-registerControllers";
import requestValidation from "../middlewares/Uservalidation";
import { userRegisterSchema } from "../utils/regiaterUserSchema";
import { loginUserSchema } from "../utils/loinUserSchema";
import { loginUser } from "../controllers/user-loginControllers";
import { verifyJwt } from "../middlewares/verifyToken";
import { logoutUser } from "../controllers/user-logoutController";

const router = Router();

router
    .route("/register")
    .post(requestValidation(userRegisterSchema), registerUser);

router
    .route("/login")
    .post(requestValidation(loginUserSchema),
    loginUser);

router
    .route("/logout")
    .post(verifyJwt,logoutUser);

export default router;
