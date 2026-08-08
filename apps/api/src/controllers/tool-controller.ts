import { NextFunction, Request, Response } from "express";
import { Tool } from "../models/tools-model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { category } from "../models/category-model";


export const createTool = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      category: categoryId,
      description,
      pricePerday,
      pricePerHour,
      currency,
      securityDeposit,
      images,
    } = req.body;

    if (
      !name ||
      !categoryId ||
      !pricePerHour ||
      !pricePerday ||
      !securityDeposit
    ) {
      throw new ApiError(404, "All fields are required");
    }

    const existCategory = await category.findById(categoryId);
    if (!existCategory) {
      throw new ApiError(404, "category not found");
    }

    const tool = await Tool.create({
      owner: req.user?._id,
      name,
      description,
      category: categoryId,
      pricePerday,
      pricePerHour,
      securityDeposit,
      currency,
      images,
    });

    res
      .status(200)
      .json(new ApiResponse(200, tool, "Tool created successfully"));
  }
);

export const getAllTool = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const tools = await Tool.find()
      .populate("owner", "fullname email")
      .populate("category", "name slug");

    return res
      .status(200)
      .json(new ApiResponse(200, tools, "Tools fetched successfully"));
  }
);

export const getToolbyId = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { toolId } = req.params;

    const tool = await Tool.findById(toolId)
      .populate("owner", "fullname email")
      .populate("category", "name slug");

    if (!tool) {
      throw new ApiError(404, "Tool not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, tool, "Tool fetched successfully"));
  }
);

export const updateTool = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { toolId } = req.params;

    const {
      name,
      category: categoryId,
      description,
      pricePerday,
      pricePerHour,
      currency,
      securityDeposit,
      availability,
      images,
    } = req.body;

    const tool = await Tool.findById(toolId);
    if (!tool) {
      throw new ApiError(404, "Tool not found");
    }

    if (tool.owner.toString() !== req.user?._id.toString()) {
      throw new ApiError(404, "You are not authorize to update");
    }
    //validate category if user wants to change it
    if (categoryId) {
      const existingCategory = await category.findById(categoryId);
      if (!existingCategory) {
        throw new ApiError(404, "category not found");
      }
    }
    const updateTool = await Tool.findByIdAndUpdate(
      toolId,
      {
        $set: {
          name,
          category: categoryId,
          description,
          pricePerday,
          pricePerHour,
          currency,
          securityDeposit,
          availability,
          images,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("owner", "fullname email")
      .populate("category", "name slug");

    return res
      .status(200)
      .json(new ApiResponse(200, updateTool, "tool updated successfully"));
  }
);

export const deleteTool = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { toolId } = req.params;

    const tool = await Tool.findById(toolId);
    if (!tool) {
      throw new ApiError(404, "Tool not found");
    }

    if (tool.owner.toString() !== req.user?._id.toString()) {
      throw new ApiError(404, "You are not allowed to update");
    }

    await Tool.findByIdAndDelete(toolId);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "tool deleted successfully"));
  }
);
