import { NextFunction, Request, Response } from "express";
import { Order } from "../models/orders-model";
import { Products } from "../models/products-model";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";

export const createOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      throw new ApiError(400, "Prduct id and quantity");
    }
    if (quantity < 1) {
      throw new ApiError(404, "quantity must be atleast 1");
    }
    const product = await Products.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    if (!product.availability) {
      throw new ApiError(404, "product is currently unavailable");
    }

    if (product.seller?.toString() === req.user?._id.toString()) {
      throw new ApiError(404, "you can not buy your own product");
    }
    // if(product.quantity? < typeof quantity) {
    //     throw new ApiError(404,`only ${product.quantity} units are available`)

    // }

    const priceAtPurchase = product.price;
    const totalAmount = priceAtPurchase * quantity;

    const order = await Order.create({
      buyer: req.user?._id,
      seller: product.seller,
      product: product._id,
      quantity,
      priceAtPurchase,
      totalAmount,
      status: "pending",
      paymentStatus: "pending",
    });

    //reduce the product quantity,
    product.quantity -= quantity;
    if (product.quantity === 0) {
      product.availability = false;
    }

    await product.save();

    return res
      .status(200)
      .json(new ApiResponse(200, order, "order created successfully"));
  }
);

export const getOrders = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const orders = await Order.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate("buyer", "fullname email")
      .populate("seller", "fullname email")
      .populate("product");

    res
      .status(200)
      .json(new ApiResponse(200, orders, "orders fetched successfully"));
  }
);
