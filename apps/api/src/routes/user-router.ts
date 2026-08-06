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
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCatogory,
} from "../controllers/category-controller";
import { createProduct, getAllProducts, updateProduct } from "../controllers/product-controller";

const router = Router();

//user routers
router
  .route("/register")
  .post(requestValidation(userRegisterSchema), registerUser);

router.route("/login").post(requestValidation(loginUserSchema), loginUser);

router.route("/logout").post(verifyJwt, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/current-user").post(verifyJwt, getCurrentUser);

router.route("/change-password").post(verifyJwt, changeCurrentPassword);

router.route("/update-account").post(verifyJwt, updateAccountDetails);

//category routers
router.route("/:createCat").post(verifyJwt, createCategory);

router.route("/:getAllcat").get(getAllCategories);

router.route("/:getCatId").get(getCategoryById);

router.route("/:updateCat").patch(verifyJwt, updateCatogory);

router.route("/:deleteCat").delete(verifyJwt, deleteCategory);

router.route("/:createProd").post(verifyJwt, createProduct);

router.route("/getProd").get(getAllProducts);

router.route("/:updateProd").patch(verifyJwt,updateProduct);

export default router;
