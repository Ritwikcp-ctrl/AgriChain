import { NextFunction, Request, Response } from "express";
import { Products } from "../models/products-model";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { category } from "../models/category-model";

export const createProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      title,
      description,
      quantity,
      price,
      category: categoryId,
      images,
    } = req.body;

    if (!title || !quantity || !unit || !price || !categoryId) {
      throw new ApiError(400, "All field is required ");
    }

    const existingCategory = await category.findById(categoryId);
    if (!existingCategory) {
      throw new ApiError(400, "category not found");
    }

    const product = await Products.create({
      seller: req.user?._id,
      title,
      description,
      quantity,
      unit:"kg",
      price,
      category: categoryId,
      images,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, product, "Product created successfully"));
  }
);
