import { NextFunction, Request, Response } from "express";
import { category } from "../models/category-model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const createCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, slug, price, description } = req.body;

    if (!name || !slug || !price) {
      throw new ApiError(201, "All field is required ");
    }

    const existCategory = await category.findOne({
      $or: [{ name }, { slug }],
    });
    if (existCategory) {
      throw new ApiError(201, "Category already exists");
    }

    const newCategory:any = await category.create({
      name,
      slug,
      description,
      price,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, newCategory, "category created succefully"));
  }
);

export const getAllCategories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await category.find({
      isActive: true,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, categories, "categories fetched succefully"));
  }
);

export const getCategoryById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const foundCategory = await category.findById(categoryId);
    if (!foundCategory) {
      throw new ApiError(201, "category not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, foundCategory, "category fetched succefully"));
  }
);

export const updateCatogory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const { name, slug, price, image, description, icon, isActive } = req.body;

    const updateCat = await category.findByIdAndUpdate(
      categoryId,
      {
        $set: {
          name,
          slug,
          price,
          image,
          description,
          icon,
          isActive,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updateCat) {
      throw new ApiError(201, "category is not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updateCat, "category update successfully"));
  }
);

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;

    const deleteCat = await category.findByIdAndDelete(categoryId);
    if (!deleteCat) {
      throw new ApiError(201, "category not found");
    }

    return res.status(200).json(new ApiResponse(200, {}, "category deleted"));
  }
);
