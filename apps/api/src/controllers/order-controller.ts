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

export const getOrderById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("buyer", "fullname email")
      .populate("seller", "fullname email")
      .populate("product");

    if (!order) {
      throw new ApiError(404, "order not found");
    }
    //only buyer or seller can view this order
    const userId = req.user?._id.toString();

    const isBuyer = order.buyer._id.toString() === userId;
    const isSeller = order.seller._id.toString() === userId;

    if (!isBuyer && !isSeller) {
      throw new ApiError(404, "you are not allowed to view this order");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, order, "order fetched successfully"));
  }
);

export const cancelOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, "order not found");
    }

    if (order.buyer.toString() !== req.user?._id.toString()) {
      throw new ApiError(404, "only the buyer can cancel this order");
    }

    if (order.status !== "pending") {
      throw new ApiError(
        400,
        `order cannot be cancelled because its status is ${order.status}`
      );
    }

    const product = await Products.findById(order.product);
    if (!product) {
      throw new ApiError(404, "product not found");
    }
    product.quantity += order.quantity;
    product.availability = true;
    await product.save();

    order.status = "cancelled";
    await order.save();

    return res
      .status(200)
      .json(new ApiResponse(200, order, "order cancelled successfully"));
  }
);

export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatus = ["confirmed", "shipped", "delivered"];

    if (!status || !allowedStatus.includes(status)) {
      throw new ApiError(404, "Invalid order status");
    }
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, "order not found");
    }

    if (order.seller.toString() !== req.user?._id.toString()) {
      throw new ApiError(404, "only the seller can update the order status");
    }
    if (status === "confirmed" && order.status !== "pending") {
      throw new ApiError(404, "only the pending orders can be confirmed");
    }
    if (status === "shipped" && order.status !== "confirmed") {
      throw new ApiError(404, "only confirmed orders can be shipped");
    }
    if (status === "deliverd" && order.status !== "shipped") {
      throw new ApiError(404, "only shipped orders can be delivered");
    }

    order.status = status;
    await order.save();

    return res
      .status(200)
      .json(new ApiResponse(200,order, `order ${status} successfully`));
  }
);
