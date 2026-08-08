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
      unit,
    } = req.body;

    if (!title || !quantity|| !price || !unit || !categoryId) {
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
      unit: "kg",
      price,
      category: categoryId,
      images,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, product, "Product created successfully"));
  }
);

export const getAllProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const products = await Products.find()
      .populate("seller", "fullName eamil")
      .populate("category", "name slug");

    return res
      .status(200)
      .json(new ApiResponse(200, products, "Products fetched successfully"));
  }
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    const {
      title,
      description,
      quantity,
      unit,
      price,
      category: categoryId,
      availability,
      status,
      listingType,
      images,
    } = req.body;

    const product = await Products.findById(productId);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    //check ownerships
    if (product.seller.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "you are not allowed to update this product");
    }

    //check category if it is being changed
    if (categoryId) {
      const existingCategory = await category.findById(categoryId);
      if (!existingCategory) {
        throw new ApiError(403, "category not found");
      }
    }

    const updatedProduct = await Products.findByIdAndUpdate(
      productId,
      {
        $set: {
          title,
          description,
          quantity,
          unit,
          price,
          category: categoryId,
          availability,
          status,
          listingType,
          images,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("seller", "fullname email")
      .populate("category", "name slug");

    return res
      .status(200)
      .json(
        new ApiResponse(200, updateProduct, "Product updated successfully")
      );
  }
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    const product = await Products.findById(productId);

    if (!product) {
      throw new ApiError(404, "product is not found ");
    }
    //only the seller can delete the product
    if (product.seller.toString() !== req.user?._id.toString()) {
      throw new ApiError(403, "You are not authorize to delete this product  ");
    }
    await Products.findByIdAndDelete(productId);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Product delete successfully"));
  }
);
