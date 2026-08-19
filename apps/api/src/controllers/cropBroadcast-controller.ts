import { NextFunction, Request, Response } from "express";
import { CropBroadcast } from "../models/cropBroadcast.model";
import { Products } from "../models/products-model";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { User } from "../models/user-model";
import { connectionManager } from "../websocket/connectionManager";

export const createCropBroadcast = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId, quantity, price, latitude, longitude, radius } =
      req.body;

    if (
      !productId ||
      !quantity ||
      latitude === undefined ||
      longitude === undefined
    ) {
      throw new ApiError(404, "Product ,quantity and location are required");
    }

    const product = await Products.findById(productId);
    if (!product) {
      throw new ApiError(404, "product not found");
    }

    if (product.seller?.toString() !== req.user?._id.toString()) {
      throw new ApiError(404, "You can only broadcast your own product");
    }

    if (product.quantity < quantity) {
      throw new ApiError(404, `only ${product.quantity} units are available`);
    }

    const broadcast = await CropBroadcast.create({
      farmer: req.user?._id,
      product: product._id,
      quantity,
      price: price ?? product.price,
      latitude,
      longitude,
      radius: radius ?? 20,
      status: "broadcasting",
    });

    const nearbyUsers = await User.find({
      role: {
        $in: ["buyer", "cold_storage"],
      },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [broadcast.longitude, broadcast.latitude],
          },
          $maxDistance: broadcast.radius * 1000,
        },
      },
    });

    //send the notification through websocket

    for (const user of nearbyUsers) {
      connectionManager.sendToUser(user._id.toString(), {
        event: "CROP_BROADCAST",
        date: {
          broadcastId: broadcast._id,
          productId: broadcast.product,
          farmerId: broadcast.farmer,
          quantity: broadcast.quantity,
          price: broadcast.price,
        },
      });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(201, broadcast, "crop broadcast created successfully")
      );
  }
);
