import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
} from "../controllers/user-controllers";
import { loginUser } from "../controllers/user-controllers";
import { logoutUser } from "../controllers/user-controllers";
import requestValidation from "../middlewares/Uservalidation";
import { userRegisterSchema } from "../utils/regiaterUserSchema";
import { loginUserSchema } from "../utils/loinUserSchema";
import { verifyJwt } from "../middlewares/verifyToken";

// requestValidation(userRegisterSchema),

const router = Router();

//user routers
router
  .route("/register")
  .post( registerUser);
  console.log("routes are working")

router.route("/login").post(requestValidation(loginUserSchema), loginUser);

router.route("/logout").post(verifyJwt, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/current-user").post(verifyJwt, getCurrentUser);

router.route("/change-password").post(verifyJwt, changeCurrentPassword);

router.route("/update-account").post(verifyJwt, updateAccountDetails);







export default router;
