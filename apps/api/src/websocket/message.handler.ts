import { WebSocket,RawData } from "ws";
import { Conversation } from "../models/conversation-model";
import { Message } from "../models/message-model";
import { connectionManager } from "./connectionManager";

import ApiError from "../utils/ApiError";

export interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
}

interface MessagePayload {
  conversationId?: string;
  message?: string;
}

interface WebSocketEvent {
  event: string;
  data?: MessagePayload;
}

export const handleMessage = async (
  socket: AuthenticatedWebSocket,
  rawMessage: RawData
) => {
  const parsedMessage: WebSocketEvent = JSON.parse(rawMessage.toString());

  switch (parsedMessage.event) {
    case "SEND_MESSAGE":
      await handleSendMessage(socket, parsedMessage.data);
      break;
    default:
      socket.send(
        JSON.stringify({
          event: "ERROR",
          data: {
            message: "Unknown event",
          },
        })
      );
      throw new ApiError(404, "Invalid websocket message");
  }
};

const handleSendMessage = async (
  socket: AuthenticatedWebSocket,
  data?: MessagePayload
) => {
  //user must be autheticated
  if (!socket.userId) {
    socket.close(1000, "Unauthorized");
    return;
  }

  const conversationId = data?.conversationId;
  const messageText = data?.message?.trim();

  if (!conversationId || !messageText) {
    socket.send(
      JSON.stringify({
        event: "ERROR",
        data: {
          message: "consversationId and message are required",
        },
      })
    );
    return;
  }

  //find conversation
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    socket.send(
      JSON.stringify({
        event: "ERROR",
        data: {
          message: "Conversation not found",
        },
      })
    );
    return;
  }

  if (conversation.status !== "active") {
    socket.send(
      JSON.stringify({
        event: "ERROR",
        data: {
          message: "conversation is closed",
        },
      })
    );
    return;
  }

  const savedMessage = await Message.create({
    conversationId: conversation._id,
    senderId: socket.userId,
    message: messageText,
  });
  for (const participant of conversation.participants) {
    const participantId = participant.toString();
    connectionManager.sendToUser(participantId, {
      event: "NEW_MESSAGE",
      data: {
        messageId: savedMessage._id.toString(),
        conversationId: conversation._id.toString(),
        senderId: socket.userId,
        message: savedMessage.message,
        createdAt: savedMessage.createdAt,
      },
    });
  }
};
