import { NextFunction, Request, Response } from "express";
import { BroadcastRequest } from "../models/broadcastRequest.model";
import { CropBroadcast } from "../models/cropBroadcast.model";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";

import { connectionManager } from "../websocket/connectionManager";
import { Conversation } from "../models/conversation-model";

export const createBroadcastRequest = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { broadcastId } = req.params;
    if (!req.user) {
      throw new ApiError(404, "Unauthorized");
    }

    const broadcast = await CropBroadcast.findById(broadcastId);

    if (!broadcast) {
      throw new ApiError(404, "Boradcast not found");
    }

    if (broadcast.status !== "broadcasting") {
      throw new ApiError(404, "This broadcast is no longer accepting request");
    }

    if (broadcast.farmer.toString() === req.user._id.toString()) {
      throw new ApiError(404, "You can't rquest your own broadcast");
    }

    const existtingRequest = await BroadcastRequest.findOne({
      boradcast: broadcast._id,
      requester: req.user._id,
    });

    if (existtingRequest) {
      throw new ApiError(404, "You have already requested this broadcast");
    }

    const request = await BroadcastRequest.create({
      broadcast: broadcast._id,
      requester: req.user._id,
      status: "pending",
    });

    connectionManager.sendToUser(broadcast.farmer.toString(), {
      event: "CROP_REQUEST",
      data: {
        requestId: request._id,
        broadcastId: broadcast._id,
        requesterId: req.user._id,
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(201, request, "Broadcast request cerated successfully")
      );
  }
);

export const acceptBrodcastRequest = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { requestId } = req.params;

    if (!req.user) {
      throw new ApiError(404, "unauthorized");
    }

    const broadcastRequest = await BroadcastRequest.findById(requestId);
    if (!broadcastRequest) {
      throw new ApiError(404, "Broadcast request not found");
    }

    const broadcast = await CropBroadcast.findById(broadcastRequest.broadcast);

    if (!broadcast) {
      throw new ApiError(404, "Broadcast not found");
    }

    //only the farmer who created the broadcast can accept

    if (broadcast.farmer.toString() !== req.user._id.toString()) {
      throw new ApiError(
        404,
        "only the broadcast owner can accept this request"
      );
    }

    if (broadcast.status !== "broadcasting") {
      throw new ApiError(404, "This broadcast is no longer accepting requests");
    }

    if (broadcastRequest.status !== "pending") {
      throw new ApiError(404, "This request is no longer pending");
    }

    broadcastRequest.status = "accepted";
    await broadcastRequest.save();

    broadcast.status = "matched";
    await broadcast.save();

    await BroadcastRequest.updateMany(
      {
        boradcast: broadcast._id,
        _id: { $ne: broadcastRequest._id },
        status: "pending",
      },
      {
        $set: {
          status: "rejected",
        },
      }
    );

    let conversation = await Conversation.findOne({
      broadcastId: broadcast._id,
      participants: {
        $all: [broadcast.farmer, broadcastRequest.requester],
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [broadcast.farmer, broadcastRequest.requester],
        cropId: broadcast.product,
        broadcastId: broadcast._id,
        status: "active",
      });
    }

    connectionManager.sendToUser(broadcastRequest.requester.toString(), {
      event: "REQUEST_ACCEPTED",
      data: {
        requestId: broadcastRequest._id.toString(),
        broadcastId: broadcast._id.toString(),
        cropId: broadcast.product.toString(),
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          request: broadcastRequest,
          broadcast,
          conversation,
        },
        "Broadcast request accepted"
      )
    );
  }
);
