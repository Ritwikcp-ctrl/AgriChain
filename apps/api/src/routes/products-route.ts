import { Router } from "express";

import { verifyJwt } from "../middlewares/verifyToken";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "../controllers/product-controller";

const router = Router();

router.route("/:createProd").post(verifyJwt, createProduct);

router.route("/getProd").get(getAllProducts);

router.route("/:updateProd").patch(verifyJwt, updateProduct);

router.route("/:deleteProd").delete(verifyJwt, deleteProduct);

export default router