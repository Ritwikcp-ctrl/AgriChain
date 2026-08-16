import { Request, Response, NextFunction } from "express";
import { Message } from "../models/message-model";
import { Conversation } from "../models/conversation-model";
import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";

export const sendMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { conversationId, message } = req.body;

    if (!conversationId || !message?.trim()) {
      return new ApiError(404, "These fields are required as per detailing ");
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversationId) {
      return new ApiError(404, "Conversation not found");
    }

    const userId = req.user?._id;
    if (!userId) {
      return res
        .status(404)
        .json(new ApiError(404, "user not found , Unauthorized"));
    }

    const isParticipant = conversation?.participants.some(
      (participantId) => participantId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return new ApiError(404, "you are not a  participant in this conversion");
    }

    if (conversation?.status !== "active") {
      return new ApiError(404, "conversation is closed");
    }

    const newMessage = await Message.create({
      conversationId: conversation._id,
      senderId: userId,
      message: message.trim(),
    });

    return res
      .status(201)
      .json(new ApiResponse(202, newMessage, "Message sent successfully"));
  }
);

export const getConversatinMessages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return new ApiError(404, "conversaton not found");
    }

    const userId = req.user?._id;

    if (!userId) {
      return new ApiError(404, "Unauthorized error");
    }

    const isParticipant = conversation.participants.some(
      (participantId) => participantId.toString() === userId.toString()
    );

    if (!isParticipant) {
      return new ApiError(
        404,
        "You are not a participant in this conversation"
      );
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "name email");

    return res
      .status(200)
      .json(new ApiResponse(200, messages, "we got the messages"));
  }
);
