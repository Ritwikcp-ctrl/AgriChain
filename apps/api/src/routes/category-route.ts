import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCatogory,
} from "../controllers/category-controller";
import { verifyJwt } from "../middlewares/verifyToken";

const router = Router();



router.route("/createCat").post(verifyJwt, createCategory);

router.route("/getAllcat").get(getAllCategories);

router.route("/getCatId").get(getCategoryById);

router.route("/updateCat").patch(verifyJwt, updateCatogory);

router.route("/deleteCat").delete(verifyJwt, deleteCategory);

export default router;
